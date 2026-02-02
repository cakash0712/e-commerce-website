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
  Target,
  Rocket,
  Sparkles,
  ChevronRight,
  Eye,
  Layers,
  Cpu,
  History,
  Compass,
  Briefcase
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Icon mapping helper for formal display
const getIcon = (iconName) => {
  const icons = {
    Shield, Heart, CheckCircle, Globe, Zap, ArrowRight,
    Users, Award, Truck, Headphones, Star, Package,
    Clock, MapPin, Target, Rocket, Sparkles, Eye, Layers,
    Cpu, History, Compass, Briefcase
  };
  return icons[iconName] || Sparkles;
};

const About = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const ports = [8000, 8001];
        let aboutRes = null;
        let reviewsRes = null;

        for (const port of ports) {
          try {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || `http://localhost:${port}`;
            const [about, revs] = await Promise.all([
              axios.get(`${API_BASE}/api/public/about`, { timeout: 3000 }),
              axios.get(`${API_BASE}/api/public/reviews`, { timeout: 3000 })
            ]);

            if (about.data) {
              aboutRes = about.data;
              reviewsRes = revs.data || [];
              break;
            }
          } catch (err) {
            continue;
          }
        }

        if (aboutRes) {
          setData(aboutRes);
          setReviews(reviewsRes);
          setError(null);
        } else {
          throw new Error("Connection failed");
        }
      } catch (err) {
        console.error("Error fetching dynamic data:", err);
        setError("Establishing live data link failed. Our real-time infrastructure is currently undergoing maintenance.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center pt-24">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-b-2 border-violet-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center text-violet-600">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm font-medium text-slate-400 uppercase tracking-widest animate-pulse">Establishing Connection</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-32 text-slate-900">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-8">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Request Interrupted</h2>
          <p className="text-slate-500 mb-10 leading-relaxed">{error || "We encountered an issue retrieving our company profile. Our team has been notified."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 h-12 rounded-lg shadow-lg shadow-violet-200"
            >
              Refresh Page
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-white px-8 h-12 rounded-lg"
              >
                Return Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      <Navigation />

      {/* Hero Section - Refined & Formal */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-24 lg:pt-48 lg:pb-36 bg-[#F8F9FF] overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-violet-600/[0.02] -skew-x-12 hidden md:block" />
        <div className="absolute top-20 -left-20 w-80 h-80 bg-violet-200/20 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl text-left">
            <div className="flex items-center justify-start gap-3 mb-6">
              <span className="h-[1px] w-6 bg-violet-600" />
              <span className="text-violet-600 font-bold tracking-[0.2em] uppercase text-[10px]">{data.hero_badge}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-slate-900 leading-[1.1] mb-6 md:mb-10">
              {data.hero_title}
            </h1>

            <p className="text-base md:text-xl text-slate-500 leading-relaxed mb-8 md:mb-12 max-w-2xl font-light">
              {data.hero_description}
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <Link to="/shop" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-slate-900 hover:bg-violet-700 text-white font-semibold px-10 h-14 md:h-16 rounded-xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                  Start Exploring <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 w-full md:w-auto py-4 md:py-0 border-t md:border-t-0 border-slate-100">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 14}`} alt="client" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-900">{data.hero_stat_number}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{data.hero_stat_label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics - Mobile Horizontal Scroll */}
      <section className="py-12 md:py-24 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-12 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x no-scrollbar">
            {data.stats.map((stat, i) => {
              const Icon = getIcon(stat.icon_name);
              return (
                <div key={i} className="min-w-[160px] md:min-w-0 snap-center p-6 md:p-0 bg-slate-50 md:bg-transparent rounded-2xl md:rounded-none group text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600/10 text-violet-600 mb-4 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-3xl lg:text-5xl font-serif font-bold text-slate-900 mb-1">{stat.number}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Roots Section - Overlapping Mobile Design */}
      <section className="py-20 md:py-32 lg:py-48 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/3] md:aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl">
                <img
                  src={data.story_image}
                  alt="Marketplace Culture"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Overlapping mobile card */}
              <div className="static md:absolute mt-[-40px] md:mt-0 md:-bottom-12 md:-right-12 z-20 mx-4 md:mx-0 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center text-violet-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 font-serif">{data.story_overlay_title}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">{data.story_overlay_text}</p>
              </div>
            </div>

            <div className="lg:col-span-6 lg:pl-16 space-y-10 mt-12 lg:mt-0">
              <div className="space-y-6">
                <span className="text-violet-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="w-2 h-[1px] bg-violet-600" /> {data.story_subtitle}
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-slate-900 leading-tight">
                  {data.story_title}
                </h2>
                <p className="text-base text-slate-500 leading-relaxed italic font-light">
                  {data.story_description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                {data.story_highlights?.map((item, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-3">{item.title}</h5>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews - App Styled Snap Scroll */}
      {reviews && reviews.length > 0 && (
        <section className="py-20 md:py-32 bg-slate-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-12 md:mb-20 text-center md:text-left">
              <span className="text-violet-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">{data.reviews_subtitle}</span>
              <h2 className="text-3xl md:text-5xl font-serif text-slate-900">{data.reviews_title}</h2>
            </div>

            <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-8 overflow-x-auto md:overflow-visible pb-8 snap-x no-scrollbar">
              {reviews.slice(0, 6).map((review, i) => (
                <div key={i} className="min-w-[280px] md:min-w-0 snap-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-3 h-3 ${idx < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 font-light italic leading-relaxed mb-6 block">
                      "{review.comment}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter">
                      {review.user_name?.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">{review.user_name}</h5>
                      <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Verified Buyer</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Core Values - High Density 2-Column Grid on Mobile */}
      <section className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">{data.values_title}</h2>
            <p className="text-xs md:text-base text-slate-400 font-light">{data.values_intro}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-1">
            {data.values.map((value, i) => {
              const Icon = getIcon(value.icon_name);
              return (
                <div key={i} className="p-6 md:p-12 bg-white/5 border border-white/5 hover:bg-white/10 transition-all rounded-2xl md:rounded-none flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-xs md:text-lg font-serif mb-2 uppercase tracking-wide">{value.title}</h3>
                  <p className="text-[10px] md:text-sm text-slate-400 font-light line-clamp-3 md:line-clamp-none">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section - Clean Heritage View */}
      <section className="py-20 md:py-32 lg:py-48 bg-[#FAFAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-20">
            <div className="lg:col-span-12 xl:col-span-5 relative">
              <div className="sticky top-24 md:top-40 text-center md:text-left">
                <span className="text-violet-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 md:mb-6 block">{data.timeline_badge}</span>
                <h2 className="text-3xl md:text-6xl font-serif text-slate-900 leading-[1.1] mb-6 md:mb-8">
                  {data.timeline_title}
                </h2>
                <div className="space-y-6 md:space-y-8">
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-light mx-auto md:mx-0 max-w-lg">
                    {data.timeline_intro}
                  </p>
                  <div className="inline-flex items-center gap-4 py-3 md:py-4 px-5 md:px-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <History className="w-5 h-5 md:w-6 md:h-6 text-violet-600" />
                    <div className="text-left">
                      <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">{data.timeline_subtitle}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-wide">Updated Fiscal Year {new Date().getFullYear()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-12 xl:col-span-7 space-y-4 pt-10 xl:pt-0">
              {data.milestones.map((item, i) => (
                <div key={i} className="group flex items-start gap-4 md:gap-8 p-6 md:p-10 bg-white rounded-3xl border border-slate-100 hover:border-violet-100 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-900/[0.03]">
                  <span className="text-2xl md:text-3xl font-serif italic text-violet-600/30 group-hover:text-violet-600 transition-colors duration-500 shrink-0">{item.year}</span>
                  <div className="pt-1">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3 font-serif uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs md:text-sm text-slate-500 font-light leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Professional Invitation */}
      <section className="py-24 md:py-40 relative bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-violet-50 text-violet-600 mb-8 md:mb-10">
            <Rocket className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-3xl md:text-6xl font-serif text-slate-900 mb-8 md:mb-10 leading-tight">
            {data.cta_title}
          </h2>
          <p className="text-base md:text-lg text-slate-400 font-light mb-12 md:mb-16 leading-relaxed max-w-2xl mx-auto">
            {data.cta_description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-violet-700 text-white font-semibold px-12 h-16 rounded-xl transition-all shadow-xl shadow-slate-200">
                Start Exploring
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-600 hover:bg-slate-50 px-12 h-16 rounded-xl font-semibold">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Refined Global Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-section {
          animation: fadeInScale 1s ease-out forwards;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        `
      }} />
    </div>
  );
};

export default About;
