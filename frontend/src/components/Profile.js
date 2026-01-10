import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, ShoppingBag, Bell, Shield, CreditCard } from "lucide-react";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    bio: "Loyal customer who loves great deals!"
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    orderUpdates: true
  });

  const orderHistory = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 299.99,
      items: ["Premium Wireless Headphones", "Smart Watch Pro"]
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "Shipped",
      total: 149.99,
      items: ["Comfortable Running Shoes"]
    },
    {
      id: "ORD-003",
      date: "2023-12-20",
      status: "Delivered",
      total: 89.99,
      items: ["Organic Coffee Beans"]
    }
  ];

  const handleSaveProfile = () => {
    // Mock save
    alert("Profile updated successfully!");
  };

  const handleSaveSettings = () => {
    // Mock save
    alert("Settings updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{userInfo.name}</h1>
            <p className="text-gray-600">{userInfo.email}</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={userInfo.address}
                      onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={userInfo.bio}
                    onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveProfile} className="bg-violet-600 hover:bg-violet-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive order updates via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Promotional Emails</Label>
                        <p className="text-sm text-gray-600">Receive deals and promotions</p>
                      </div>
                      <Switch
                        checked={settings.promotionalEmails}
                        onCheckedChange={(checked) => setSettings({...settings, promotionalEmails: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Order Updates</Label>
                        <p className="text-sm text-gray-600">Get notified about order status changes</p>
                      </div>
                      <Switch
                        checked={settings.orderUpdates}
                        onCheckedChange={(checked) => setSettings({...settings, orderUpdates: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Security
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Payment Methods
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      Delete Account
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="bg-violet-600 hover:bg-violet-700">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Order #{order.id}</h4>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Date: {order.date}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Items: {order.items.join(', ')}
                      </p>
                      <p className="font-semibold">Total: ${order.total}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;