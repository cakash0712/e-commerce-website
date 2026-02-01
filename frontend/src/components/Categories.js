import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Grid3X3,
  Laptop,
  Shirt,
  Watch,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Sparkles,
  Baby,
  Car,
  Utensils,
  Flower2,
  Gamepad2,
  Camera,
  Headphones,
  Gift,
  Gem,
  Pill,
  PawPrint,
  Brush,
  Eye,
  Smartphone,
  Tablet,
  Wind,
  Bed,
  GlassWater,
  ShoppingBag,
  BaggageClaim,
  Sun,
  Palette,
  Bike,
  Footprints,
  ArrowRight,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Categories = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping for categories
  const getCategoryIcon = (slug) => {
    const iconMap = {
      electronics: Laptop,
      laptops: Laptop,
      smartphones: Smartphone,
      tablets: Tablet,
      fashion: Shirt,
      'mens-shirts': Shirt,
      'mens-shoes': Footprints,
      'womens-dresses': ShoppingBag,
      'womens-shoes': Footprints,
      tops: Shirt,
      accessories: Watch,
      'womens-watches': Watch,
      'mens-watches': Watch,
      sunglasses: Sun,
      'womens-bags': ShoppingBag,
      'womens-jewellery': Gem,
      'home-decoration': HomeIcon,
      'home-&-garden': HomeIcon,
      furniture: Bed,
      'kitchen-accessories': Utensils,
      sports: Dumbbell,
      'sports-accessories': Bike,
      books: BookOpen,
      beauty: Sparkles,
      fragrances: Wind,
      'skin-care': Sparkles,
      baby: Baby,
      automotive: Car,
      motorcycle: Bike,
      vehicle: Car,
      groceries: Utensils,
      snacks: Utensils,
      garden: Flower2,
      gaming: Gamepad2,
      cameras: Camera,
      audio: Headphones,
      'mobile-accessories': Smartphone,
      gifts: Gift,
      jewelry: Gem,
      health: Pill,
      pets: PawPrint,
      art: Brush,
    };
    return iconMap[slug] || Grid3X3;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE}/api/public/categories`),
          axios.get(`${API_BASE}/api/products`)
        ]);

        const backendCategories = catRes.data;
        const products = prodRes.data;
        setAllProducts(products);

        // Get all unique categories from products
        const uniqueProductCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

        const activeCategories = uniqueProductCategories.map(catName => {
          const metadata = backendCategories.find(bc => bc.name?.toLowerCase() === catName.toLowerCase());
          const categoryProducts = products.filter(p => p.category?.toLowerCase() === catName.toLowerCase());

          return {
            id: metadata?.id || catName.toLowerCase().replace(/\s+/g, '-'),
            name: catName,
            slug: catName.toLowerCase().replace(/\s+/g, '-'),
            productCount: categoryProducts.length,
            link: metadata?.link || `/shop?category=${encodeURIComponent(catName.toLowerCase())}`
          };
        });

        setApiCategories(activeCategories);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryInfo = (slug) => {
    const IconComponent = getCategoryIcon(slug);
    return { icon: IconComponent };
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 pt-32 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 hover:text-violet-600 transition-colors mr-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <div className="w-px h-3 bg-gray-200 mx-1.5" />
            <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-gray-900">Categories</span>
          </nav>

          <div className="space-y-1 sm:space-y-2 text-left">
            <h1 className="text-4xl sm:text-6l font-black text-gray-900 tracking-tighter uppercase leading-none">
              All Categories
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm font-medium">
              Explore our dynamic range of vendor-supplied categories
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-gray-100 border-t-violet-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Synchronizing Inventory</p>
          </div>
        ) : (
          /* HIGH-END DISCOVERY MODE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {apiCategories.map((cat, idx) => {
              const { icon: IconComponent } = getCategoryInfo(cat.slug);
              const firstProduct = allProducts.find(p => p.category?.toLowerCase() === cat.name?.toLowerCase());

              return (
                <div key={cat.id} className="contents">
                  {/* MOBILE VIEW - KEEP EXISTING DESIGN */}
                  <button
                    onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name.toLowerCase())}`)}
                    className="lg:hidden group relative h-48 rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm outline-none w-full"
                  >
                    {/* Visual Background */}
                    {firstProduct?.image ? (
                      <div className="absolute inset-0">
                        <img
                          src={firstProduct.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-violet-600" />
                    )}

                    {/* Content Overlay */}
                    <div className="relative h-full p-6 flex flex-col justify-end items-start text-left">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>

                      <div className="space-y-1 text-left">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                          {cat.name}
                        </h3>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          {cat.productCount} Collections
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* DESKTOP VIEW - NEW DESIGN LIKE HOME PAGE */}
                  <div
                    onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name.toLowerCase())}`)}
                    className="hidden lg:flex group rounded-3xl border border-gray-200/60 p-10 flex-col items-center justify-center text-center hover:bg-white hover:shadow-2xl hover:border-violet-100 transition-all duration-500 min-h-[250px] cursor-pointer bg-white"
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden border border-gray-100">
                      {firstProduct?.image ? (
                        <img src={firstProduct.image} alt={cat.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <IconComponent className="w-12 h-12 text-violet-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors uppercase tracking-tight">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full group-hover:bg-violet-50 transition-colors">
                      <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                        Explore
                      </span>
                      <ChevronRight className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;