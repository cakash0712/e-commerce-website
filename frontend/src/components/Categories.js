import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "../App";
import {
  ShoppingCart,
  Star,
  Heart,
  ChevronRight,
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
  Footprints
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
        const categories = catRes.data;
        const products = prodRes.data;
        setAllProducts(products);

        const categoryObjects = categories.map((cat, index) => {
          const categoryProducts = products.filter(p => p.category?.toLowerCase() === cat.name?.toLowerCase());
          return {
            id: index,
            name: cat.name,
            slug: cat.name?.toLowerCase().replace(/\s+/g, '-'),
            productCount: categoryProducts.length,
            link: cat.link || `/categories/${cat.name?.toLowerCase().replace(/\s+/g, '-')}`
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
    ? allProducts.filter(p => p.category?.toLowerCase() === selectedCategory.slug?.toLowerCase())
    : [];

  const getCategoryInfo = (slug) => {
    const IconComponent = getCategoryIcon(slug);
    return { icon: IconComponent };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-violet-600">Home</Link>
            <span className="mx-2">›</span>
            {selectedCategory ? (
              <>
                <button onClick={() => setSelectedCategory(null)} className="hover:text-violet-600">Categories</button>
                <span className="mx-2">›</span>
                <span className="text-gray-900 font-medium">{selectedCategory.name}</span>
              </>
            ) : (
              <span className="text-gray-900 font-medium">Categories</span>
            )}
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory.name : "Shop by Category"}
            </h1>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-violet-600 hover:underline font-medium"
              >
                ← Back to All Categories
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading categories...</p>
          </div>
        ) : !selectedCategory ? (
          /* Categories Grid - Product Images or Icons */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apiCategories.map((cat) => {
              const { icon: IconComponent } = getCategoryInfo(cat.slug);
              const firstProduct = allProducts.find(p => p.category?.toLowerCase() === cat.slug?.toLowerCase());
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="group bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 min-h-[220px]"
                >
                  <div className="w-20 h-20 bg-transparent rounded-full flex items-center justify-center mb-6 group-hover:bg-transparent transition-colors duration-300 relative overflow-hidden shadow-inner">
                    {firstProduct?.image ? (
                      <img src={firstProduct.image} alt={cat.name} className="w-full h-full object-cover p-2 group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <IconComponent className="w-10 h-10 text-violet-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full group-hover:bg-violet-50 transition-colors">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-violet-500">{cat.productCount} Products</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-400" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Products Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{displayedProducts.length} products found</p>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">This category doesn't have any products yet.</p>
                <Button onClick={() => setSelectedCategory(null)} className="bg-violet-600 hover:bg-violet-700 text-white">
                  Browse Other Categories
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all"
                  >
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {product.discount > 10 && (
                          <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                            -{product.discount}%
                          </span>
                        )}
                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                            }}
                            className={`w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'}`}
                          >
                            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                          </button>
                          <Link
                            to={`/product/${product.id}`}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-violet-600 hover:scale-110 transition-transform"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </Link>
                    <div className="p-3">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2 group-hover:text-violet-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => addToCart(product)}
                        className="w-full mt-3 h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;