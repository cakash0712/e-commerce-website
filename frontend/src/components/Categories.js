import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, useWishlist } from "../App";
import {
  ShoppingBag,
  Star,
  Heart,
  ArrowRight,
  ChevronLeft,
  Grid3X3,
  Plus,
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
  Brush
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Categories = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Static categories with icons and colors
  const staticCategories = [
    { name: "Electronics", slug: "electronics", icon: Laptop, color: "bg-blue-500", gradient: "from-blue-500 to-cyan-500" },
    { name: "Fashion", slug: "fashion", icon: Shirt, color: "bg-pink-500", gradient: "from-pink-500 to-rose-500" },
    { name: "Accessories", slug: "accessories", icon: Watch, color: "bg-amber-500", gradient: "from-amber-500 to-orange-500" },
    { name: "Home & Decor", slug: "home-decoration", icon: HomeIcon, color: "bg-emerald-500", gradient: "from-emerald-500 to-teal-500" },
    { name: "Sports & Fitness", slug: "sports", icon: Dumbbell, color: "bg-violet-500", gradient: "from-violet-500 to-purple-500" },
    { name: "Books & Stationery", slug: "books", icon: BookOpen, color: "bg-rose-500", gradient: "from-rose-500 to-red-500" },
    { name: "Beauty & Cosmetics", slug: "beauty", icon: Sparkles, color: "bg-fuchsia-500", gradient: "from-fuchsia-500 to-pink-500" },
    { name: "Baby & Kids", slug: "baby", icon: Baby, color: "bg-sky-500", gradient: "from-sky-500 to-blue-500" },
    { name: "Automotive", slug: "automotive", icon: Car, color: "bg-slate-600", gradient: "from-slate-600 to-gray-700" },
    { name: "Food & Grocery", slug: "groceries", icon: Utensils, color: "bg-lime-500", gradient: "from-lime-500 to-green-500" },
    { name: "Garden & Outdoors", slug: "garden", icon: Flower2, color: "bg-green-500", gradient: "from-green-500 to-emerald-500" },
    { name: "Gaming", slug: "gaming", icon: Gamepad2, color: "bg-indigo-500", gradient: "from-indigo-500 to-violet-500" },
    { name: "Cameras & Photography", slug: "cameras", icon: Camera, color: "bg-gray-700", gradient: "from-gray-700 to-gray-900" },
    { name: "Audio & Music", slug: "audio", icon: Headphones, color: "bg-red-500", gradient: "from-red-500 to-orange-500" },
    { name: "Gifts & Occasions", slug: "gifts", icon: Gift, color: "bg-purple-500", gradient: "from-purple-500 to-fuchsia-500" },
    { name: "Jewelry", slug: "jewelry", icon: Gem, color: "bg-yellow-500", gradient: "from-yellow-500 to-amber-500" },
    { name: "Health & Wellness", slug: "health", icon: Pill, color: "bg-teal-500", gradient: "from-teal-500 to-cyan-500" },
    { name: "Pet Supplies", slug: "pets", icon: PawPrint, color: "bg-orange-500", gradient: "from-orange-500 to-red-500" },
    { name: "Art & Crafts", slug: "art", icon: Brush, color: "bg-cyan-500", gradient: "from-cyan-500 to-blue-500" },
    { name: "Smartphones", slug: "smartphones", icon: Laptop, color: "bg-blue-600", gradient: "from-blue-600 to-indigo-600" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://dummyjson.com/products?limit=200");
        const products = response.data.products;
        setAllProducts(products);

        const uniqueCategories = [...new Set(products.map(p => p.category))];
        const categoryObjects = uniqueCategories.map((cat, index) => {
          const product = products.find(p => p.category === cat);
          return {
            id: index,
            name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
            slug: cat,
            image: product ? (product.thumbnail || product.images[0]) : "https://via.placeholder.com/300",
          };
        });
        setApiCategories(categoryObjects);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedProducts = selectedCategory
    ? allProducts.filter(p => p.category === selectedCategory.slug).map(p => ({
      id: p.id,
      name: p.title,
      price: Math.round(p.price * 83),
      originalPrice: Math.round(p.price * 83 * (1 + p.discountPercentage / 100)),
      image: p.thumbnail || p.images[0],
      rating: p.rating,
      reviews: p.reviews ? p.reviews.length : 100,
      category: p.category
    }))
    : [];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    }
    if (rating % 1 !== 0) {
      stars.push(<Star key="half" className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400" />);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to All Categories
            </button>
          )}

          <div className="text-center">
            <Badge className="bg-white/10 text-white border-white/20 font-bold uppercase tracking-widest px-4 py-1 mb-6">
              {selectedCategory ? selectedCategory.name : "Explore All"}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              {selectedCategory ? selectedCategory.name : "Shop by Category"}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {selectedCategory
                ? `Discover amazing ${selectedCategory.name.toLowerCase()} products at unbeatable prices.`
                : "Explore our diverse collection of categories and find your perfect match."}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-500 font-medium">Loading categories...</p>
          </div>
        ) : !selectedCategory ? (
          /* Categories Grid - Premium Design */
          <div className="space-y-12">
            {/* Featured Categories */}
            {/* Featured Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {staticCategories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const matchingApiCat = apiCategories.find(c => c.slug === cat.slug);
                    if (matchingApiCat) {
                      setSelectedCategory(matchingApiCat);
                    } else {
                      setSelectedCategory({ name: cat.name, slug: cat.slug });
                    }
                  }}
                  className="group cursor-pointer"
                >
                  <div className="flex flex-col items-center p-8 rounded-[2rem] bg-gray-50 border-2 border-transparent transition-all duration-500 hover:bg-white hover:border-violet-100 hover:shadow-2xl hover:-translate-y-2">
                    <div className={`w-20 h-20 ${cat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                      <cat.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-black text-gray-900 text-center group-hover:text-violet-600 transition-colors uppercase tracking-tighter">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* Products Grid */
          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 -mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Sale Badge */}
                    {product.originalPrice > product.price && (
                      <span className="absolute top-3 left-3 bg-rose-500 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full">
                        Sale
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                    </button>

                    {/* Quick Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <Link
                        to={`/product/${product.id}`}
                        className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 hover:text-white transition-all"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 hover:text-white transition-all"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold mb-1">
                      {product.category}
                    </p>

                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-900 leading-snug line-clamp-2 mb-2 text-sm hover:text-violet-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-10 h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {displayedProducts.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-500 text-lg">No products found in this category.</p>
                  <Button
                    onClick={() => setSelectedCategory(null)}
                    className="mt-6 bg-violet-600 hover:bg-violet-700 rounded-xl"
                  >
                    Browse Other Categories
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
        }
      </main >

      <Footer />
    </div >
  );
};

export default Categories;