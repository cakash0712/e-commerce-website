import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Heart,
  CheckCircle,
  Globe,
  Zap,
  ArrowRight,
  Users,
  Award,
  Truck,
  Headphones,
  Star,
  Package,
  Clock,
  MapPin,
  ArrowLeft,
  Target,
  Rocket,
  Sparkles,
  ChevronRight,
  Eye,
  Layers,
  Cpu,
  Infinity
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Icon mapping helper with premium fallbacks
const getIcon = (iconName) => {
  const icons = {
    Shield, Heart, CheckCircle, Globe, Zap, ArrowRight,
    Users, Award, Truck, Headphones, Star, Package,
    Clock, MapPin, Target, Rocket, Sparkles, Eye, Layers, Cpu, Infinity
  };
  return icons[iconName] || Sparkles;
};

const About = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        // Try multiple potential ports to be robust
        const ports = [8000, 8001];
        let response = null;
        let lastError = null;

        for (const port of ports) {
          try {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || `http://localhost:${port}`;
            const res = await axios.get(`${API_BASE}/api/public/about`, { timeout: 3000 });
            if (res.data) {
              response = res.data;
              break;
            }
          } catch (err) {
            lastError = err;
            continue;
          }
        }

        if (response) {
          setData(response);
          setError(null);
        } else {
          throw lastError || new Error("Connection failed");
        }
      } catch (err) {
        console.error("Error fetching about data:", err);
        setError("Repository data sync failed. System uplink established but no data returned.");
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col pt-32 relative overflow-hidden">
        <Navigation />
        {/* Loading background animation */}
        <div className="absolute inset-0 bg-[#0a0a0c]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-2 border-violet-600/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-violet-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-4 border border-fuchsia-500/30 rounded-full animate-reverse-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-violet-500 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-400 animate-pulse">Syncing Archive Data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col pt-32 text-white">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/10 rounded-full blur-[150px] -z-10" />
          <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mb-8 shadow-2xl shadow-rose-900/20">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-4">Uplink Failure</h2>
          <p className="text-gray-400 font-bold mb-10 max-w-sm text-lg">{error || "Critical failure in Genesis Archive retrieval."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest px-10 h-16 rounded-2xl shadow-2xl shadow-violet-900/40 active:scale-95 transition-all"
            >
              Retry Protocol
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 font-black uppercase tracking-widest px-10 h-16 rounded-2xl active:scale-95 transition-all"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      <Navigation />

      {/* Premium Hero Section with Glassmorphism Overlay */}
      <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-violet-100/40 via-blue-50/20 to-transparent -z-10" />
        <div className="absolute -top-20 -left-10 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[120px] -z-10 animate-blob" />
        <div className="absolute top-[20%] -right-20 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[140px] -z-10 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-12 xl:col-span-7">
              {/* Protocol Label */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/5 border border-violet-600/10 text-violet-600 text-[9px] font-black uppercase tracking-[0.4em] mb-12 animate-fade-in">
                <Infinity className="w-3.5 h-3.5" /> Established Network Core
              </div>

              <h1 className="text-6xl md:text-8xl xl:text-9xl font-black text-gray-900 mb-10 leading-[0.85] tracking-tighter italic uppercase">
                {data.hero_title.split(' ').slice(0, 2).join(' ')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-900">
                  {data.hero_subtitle}
                </span>
              </h1>

              <div className="relative max-w-2xl mb-14">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-violet-600 to-transparent rounded-full" />
                <p className="text-xl lg:text-2xl font-bold text-gray-500 leading-tight pl-10 opacity-0 animate-slide-in-right">
                  {data.hero_description}
                </p>
              </div>

              <div className="flex flex-wrap gap-8 items-center">
                <Link to="/shop">
                  <Button className="bg-gray-900 hover:bg-violet-600 text-white font-black uppercase tracking-widest px-12 h-20 rounded-[2rem] text-sm shadow-2xl shadow-gray-200 transition-all hover:-translate-y-1 group active:scale-95">
                    Explore Ecosystem <ArrowRight className="ml-4 w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </Button>
                </Link>
                <div className="flex flex-col gap-2">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-200 overflow-hidden ring-1 ring-violet-50 hover:z-10 transition-transform hover:scale-110">
                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 50,000+ Active Nodes
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-12 xl:col-span-5 relative">
              <div className="relative z-10 group">
                <div className="aspect-[4/5] bg-slate-100 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(124,58,237,0.3)] rotate-3 group-hover:rotate-0 transition-all duration-1000">
                  <img
                    src="/premium_office_team.png"
                    alt="Core Infrastructure"
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-transparent to-transparent" />
                </div>
                {/* Floating Glass Card */}
                <div className="absolute -bottom-12 -left-12 p-8 bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white shadow-2xl max-w-[280px] -rotate-6 group-hover:rotate-0 transition-all duration-1000">
                  <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white mb-6">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black uppercase italic mb-2">Integrated Platform</h4>
                  <p className="text-xs font-bold text-gray-500 leading-snug">Unified commerce architecture designed for high-velocity global trade.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Velocity Stats Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {data.stats.map((stat, i) => {
              const Icon = getIcon(stat.icon_name);
              return (
                <div key={i} className="flex flex-col group p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-500">
                  <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-400 mb-10 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-xl shadow-violet-900/40">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter drop-shadow-2xl">{stat.number}</h3>
                    <div className="w-12 h-1 bg-violet-600 rounded-full group-hover:w-full transition-all duration-700" />
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-violet-400 transition-colors pt-4">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story & Vision Section */}
      <section className="py-32 lg:py-48 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative">
                <div className="aspect-square bg-white rounded-[5rem] border border-gray-100 p-4 shadow-2xl relative z-10 overflow-hidden group">
                  <img
                    src={data.story_image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"}
                    alt="Innovation Lab"
                    className="w-full h-full object-cover rounded-[4rem] group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-violet-900/10 mix-blend-overlay" />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-100 rounded-full blur-[80px] -z-10 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-[80px] -z-10" />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 text-violet-600 text-[10px] font-black uppercase tracking-[0.5em]">
                  <Cpu className="w-4 h-4 ml-1" /> Core Engine Background
                </div>
                <h2 className="text-5xl lg:text-8xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.9]">
                  {data.story_title}
                </h2>
              </div>

              <p className="text-xl font-bold text-gray-500 leading-snug border-l-4 border-gray-200 pl-8">
                {data.story_description}
              </p>

              <div className="grid grid-cols-2 gap-8 pt-6">
                {[
                  { title: "Direct Link", desc: "No intermediaries" },
                  { title: "Quantum Speed", desc: "Real-time dispatch" },
                  { title: "Hyper Secure", desc: "Encrypted transactions" },
                  { title: "Global Mesh", desc: "Logistics across borders" }
                ].map((item, i) => (
                  <div key={i} className="group cursor-default">
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">{item.title}</h5>
                    <p className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors uppercaseTracking">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Manifesto Section - Pure Tech Aesthetics */}
      <section className="py-32 lg:py-48 bg-[#0a0a0c] text-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-600 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-600 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 lg:mb-40">
            <h2 className="text-5xl lg:text-9xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-80 leading-none mb-10">
              The Manifesto
            </h2>
            <p className="text-violet-400 font-black uppercase tracking-[0.5em] text-[10px] mb-8">ZippyCart Operational Directives</p>
            <div className="flex justify-center">
              <ChevronRight className="w-8 h-8 text-violet-600 rotate-90 animate-bounce" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.values.map((value, i) => {
              const Icon = getIcon(value.icon_name);
              return (
                <div key={i} className="group relative glass-card p-12 h-full flex flex-col border border-white/5 hover:border-violet-500/40 hover:bg-white/[0.04] transition-all duration-700 rounded-none overflow-hidden">
                  {/* Subtle Background Icon */}
                  <Icon className="absolute -bottom-10 -right-10 w-48 h-48 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-all duration-1000" />

                  <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center mb-12 group-hover:bg-violet-600 group-hover:border-violet-400 transition-all duration-500">
                    <Icon className="w-6 h-6 text-violet-400 group-hover:text-white transition-all" />
                  </div>

                  <h3 className="text-2xl font-black uppercase italic mb-6 tracking-tight relative z-10">{value.title}</h3>
                  <p className="text-gray-500 font-bold leading-relaxed group-hover:text-gray-300 transition-colors uppercaseTracking text-xs relative z-10">
                    {value.description}
                  </p>

                  <div className="absolute top-0 right-0 w-1 h-0 bg-violet-600 group-hover:h-full transition-all duration-700" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Timeline Archive */}
      <section className="py-32 lg:py-52 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-32 gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-6xl lg:text-8xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.85] mb-8">
                Archive <br /> Synchronization.
              </h2>
              <p className="text-xl font-bold text-gray-400 italic border-l-2 border-violet-600 pl-8 ml-2">
                Tracing our expansion through the digital landscape since operational genesis.
              </p>
            </div>
            <div className="lg:w-1/3 pt-10">
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                <Eye className="w-8 h-8 text-violet-600 mb-6" />
                <p className="text-xs font-bold text-gray-500 italic leading-snug">Visualizing growth metrics and infrastructure deployment milestones in sequential order.</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {data.milestones.map((item, i) => (
              <div key={i} className="group grid lg:grid-cols-12 items-center p-12 bg-white hover:bg-gray-900 hover:text-white border-b border-gray-100 hover:border-transparent transition-all duration-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-0 bg-violet-600 group-hover:h-full transition-all duration-500" />

                <div className="lg:col-span-2">
                  <span className="text-4xl lg:text-6xl font-black italic tracking-tighter text-gray-300 group-hover:text-violet-500 transition-colors duration-500">{item.year}</span>
                </div>
                <div className="lg:col-span-4 mt-4 lg:mt-0">
                  <h4 className="text-2xl font-black uppercase italic tracking-tight">{item.title}</h4>
                </div>
                <div className="lg:col-span-6 mt-4 lg:mt-0">
                  <p className="text-lg font-bold text-gray-400 group-hover:text-white/60 transition-colors leading-snug lg:text-right italic">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grand Finale CTA Section */}
      <section className="py-40 lg:py-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0c] -z-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-transparent to-fuchsia-900/30 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_70%)] -z-10 animate-pulse" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-violet-400 text-[10px] font-black uppercase tracking-[0.5em] mb-16 animate-fade-in shadow-lg">
            <Rocket className="w-4 h-4" /> Ready for Deployment
          </div>

          <h2 className="text-6xl lg:text-[10rem] font-black text-white uppercase italic tracking-tighter leading-none mb-16 drop-shadow-2xl">
            Join the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Evolution.</span>
          </h2>

          <p className="text-2xl font-bold italic text-gray-400 mb-20 max-w-3xl mx-auto leading-tight opacity-80">
            Establish your node in our ecosystem today. Experience commerce re-engineered for the future.
          </p>

          <div className="flex flex-wrap justify-center gap-10">
            <Link to="/shop">
              <Button className="bg-white hover:bg-violet-600 text-gray-900 hover:text-white font-black uppercase tracking-[0.2em] px-16 h-24 rounded-[2.5rem] text-xl shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] hover:-translate-y-2 active:scale-95 transition-all">
                Launch Shop
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-16 h-24 rounded-[2.5rem] text-xl font-bold backdrop-blur-md hover:-translate-y-2 active:scale-95 transition-all">
                Contact Uplink
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-10 -z-10" />
      </section>

      <Footer />

      {/* Advanced Global Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 15px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-reverse-spin {
          animation: reverse-spin 3s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 1s ease-out 0.5s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .uppercaseTracking {
           text-transform: uppercase;
           letter-spacing: 0.15em;
        }
      `}} />
    </div>
  );
};

export default About;