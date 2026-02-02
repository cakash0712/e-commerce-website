import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, MapPin, CreditCard, Heart, Bell, LogOut, ChevronRight,
    ArrowLeft, Edit2, Shield, Settings, HelpCircle, Gift, Smartphone, Star
} from 'lucide-react';
import { useAuth } from '../../App';

const FoodProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: User, color: 'bg-blue-500' },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin, color: 'bg-orange-500' },
        { id: 'payments', label: 'Payments', icon: CreditCard, color: 'bg-green-500' },
        { id: 'favorites', label: 'Favorites', icon: Heart, color: 'bg-red-500' },
        { id: 'offers', label: 'Offers & Coupons', icon: Gift, color: 'bg-purple-500' },
        { id: 'help', label: 'Support & Help', icon: HelpCircle, color: 'bg-amber-500' },
    ];

    const stats = [
        { label: 'Orders', value: '12', icon: Smartphone },
        { label: 'Saved', value: '5', icon: Heart },
        { label: 'Reviews', value: '3', icon: Star },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-16 z-30 shadow-sm md:hidden">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Account</h1>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />

                    <div className="flex flex-col md:flex-row items-center gap-6 relative">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{user.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md text-orange-600 hover:scale-110 transition-transform">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-center md:text-left flex-grow">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {user.name}
                                <span className="bg-green-100 text-green-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Pro</span>
                            </h2>
                            <p className="text-gray-500 font-medium mb-4">{user.email || user.phone}</p>

                            <div className="flex items-center gap-6 justify-center md:justify-start">
                                {stats.map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
                                        <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-gray-800 transition-colors">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                    {/* Menu Links */}
                    <div className="space-y-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.id
                                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl bg-white shadow-sm ${activeTab === item.id ? 'text-orange-600' : 'text-gray-400'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">{item.label}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'translate-x-1' : 'text-gray-300'}`} />
                            </button>
                        ))}

                        <div className="pt-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-sm"
                            >
                                <div className="p-2 rounded-xl bg-white shadow-sm">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="hidden md:block">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full min-h-[400px]">
                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Information</h3>
                                        <p className="text-gray-500 text-sm">Update your personal details below.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Full Name</label>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-700">{user.name}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Phone</label>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-700">{user.phone || 'Not provided'}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Email</label>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-700">{user.email}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Gender</label>
                                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-700 capitalize">{user.gender || 'Not specified'}</div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                        <Shield className="w-6 h-6 text-blue-600 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900 mb-1">Account Security</h4>
                                            <p className="text-xs text-blue-700 leading-relaxed font-medium">To keep your account safe, we recommend periodically updating your password and reviewing your active login sessions.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
                                        <button className="text-orange-600 text-sm font-bold hover:underline">Add New</button>
                                    </div>

                                    <div className="space-y-4">
                                        {(user.addresses && user.addresses.length > 0 ? user.addresses : [
                                            { type: 'Home', addr: user.address || 'Stay tuned! Add your home address.', icon: Smartphone },
                                            { type: 'Work', addr: 'Add your office address for quick ordering.', icon: Settings }
                                        ]).map((address, i) => (
                                            <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-orange-100 transition-all cursor-pointer">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-bold text-gray-900">{address.type || address.label || 'Other'}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">{address.addr || address.address || address.full_address}</p>
                                                </div>
                                                <Edit2 className="w-4 h-4 text-gray-400 hover:text-orange-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodProfile;
