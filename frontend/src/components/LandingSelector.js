import React, { useState, useEffect } from 'react';
import { ShoppingBag, Utensils, ArrowRight, Sparkles, Star, Zap, Heart, Package, Clock } from 'lucide-react';

const LandingSelector = ({ onSelect }) => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const options = [
        {
            id: 'ecommerce',
            title: 'DACHCart',
            subtitle: 'E-Commerce Store',
            description: 'Discover fashion, electronics, home décor & more. Shop premium products with lightning-fast delivery.',
            icon: ShoppingBag,
            gradient: 'from-violet-600 via-purple-600 to-indigo-700',
            accentColor: 'violet',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop',
            floatingIcons: [Package, Star, Heart]
        },
        {
            id: 'food',
            title: 'DACHBites',
            subtitle: 'Food Delivery',
            description: 'Craving something delicious? Order from your favorite restaurants and get food delivered in minutes.',
            icon: Utensils,
            gradient: 'from-orange-500 via-red-500 to-pink-600',
            accentColor: 'orange',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
            floatingIcons: [Clock, Star, Zap]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                {/* Header */}
                <div className={`text-center mb-6 sm:mb-16 transition-all duration-1000 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                        <span className="text-[10px] sm:text-sm text-gray-300 font-medium lowercase italic">Welcome to DACH</span>
                    </div>
                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-4 tracking-tight leading-none">
                        What are you
                        <span className="block bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent italic lowercase">
                            looking for?
                        </span>
                    </h1>
                    <p className="text-xs sm:text-lg text-gray-400 max-w-xl mx-auto hidden sm:block">
                        Choose your experience. Shop premium products or order delicious food — all in one place.
                    </p>
                </div>

                {/* Selection Cards - 2 Columns on Mobile */}
                <div className="grid grid-cols-2 gap-3 lg:gap-10 w-full max-w-5xl px-0 sm:px-4">
                    {options.map((option, index) => (
                        <div
                            key={option.id}
                            className={`relative group cursor-pointer transition-all duration-700 ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                }`}
                            style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                            onMouseEnter={() => setHoveredCard(option.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => onSelect(option.id)}
                        >
                            {/* Card glow effect */}
                            <div className={`absolute -inset-1 bg-gradient-to-r ${option.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />

                            {/* Main card */}
                            <div className={`relative h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20`}>
                                {/* Background image with overlay */}
                                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                                    <img
                                        src={option.image}
                                        alt={option.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
                                </div>

                                {/* Floating icons */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {option.floatingIcons.map((Icon, i) => (
                                        <div
                                            key={i}
                                            className={`w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500`}
                                            style={{ transitionDelay: `${i * 100}ms` }}
                                        >
                                            <Icon className={`w-5 h-5 text-${option.accentColor}-400`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="relative p-3 sm:p-8 lg:p-10 flex flex-col h-full min-h-[200px] sm:min-h-[400px]">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-3 sm:mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <option.icon className="w-5 h-5 sm:w-10 sm:h-10 text-white" />
                                    </div>
                                    
                                    {/* Subtitle */}
                                    <span className={`text-[8px] sm:text-sm font-black uppercase tracking-widest text-${option.accentColor}-400 mb-1 lg:mb-2 italic`}>
                                        {option.subtitle}
                                    </span>

                                    {/* Title */}
                                    <h2 className="text-lg sm:text-4xl font-black text-white tracking-tighter leading-none mb-3">
                                        {option.title}
                                    </h2>

                                    {/* Stats & CTA */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 mt-auto">
                                        {/* CTA Button */}
                                        <button className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-white text-slate-900 font-black text-[10px] sm:text-base uppercase tracking-widest transform group-hover:translate-x-1 transition-all duration-300 shadow-lg`}>
                                            Enter
                                            <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <p className={`text-gray-500 text-sm mt-12 transition-all duration-1000 delay-700 ${animationComplete ? 'opacity-100' : 'opacity-0'}`}>
                    You can switch between apps anytime from the menu
                </p>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default LandingSelector;
