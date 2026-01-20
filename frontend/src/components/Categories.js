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

  // Static categories with icons mapped to API slugs
  const staticCategories = [
    { name: "Electronics", slug: "electronics", icon: Laptop },
    { name: "Laptops", slug: "laptops", icon: Laptop },
    { name: "Smartphones", slug: "smartphones", icon: Smartphone },
    { name: "Tablets", slug: "tablets", icon: Tablet },
    { name: "Fashion", slug: "fashion", icon: Shirt },
    { name: "Mens Shirts", slug: "mens-shirts", icon: Shirt },
    { name: "Mens Shoes", slug: "mens-shoes", icon: Footprints },
    { name: "Womens Dresses", slug: "womens-dresses", icon: ShoppingBag },
    { name: "Womens Shoes", slug: "womens-shoes", icon: Footprints },
    { name: "Tops", slug: "tops", icon: Shirt },
    { name: "Accessories", slug: "accessories", icon: Watch },
    { name: "Womens Watches", slug: "womens-watches", icon: Watch },
    { name: "Mens Watches", slug: "mens-watches", icon: Watch },
    { name: "Sunglasses", slug: "sunglasses", icon: Sun },
    { name: "Womens Bags", slug: "womens-bags", icon: ShoppingBag },
    { name: "Womens Jewellery", slug: "womens-jewellery", icon: Gem },
    { name: "Home & Decor", slug: "home-decoration", icon: HomeIcon },
    { name: "Furniture", slug: "furniture", icon: Bed },
    { name: "Kitchen Accessories", slug: "kitchen-accessories", icon: Utensils },
    { name: "Sports & Fitness", slug: "sports", icon: Dumbbell },
    { name: "Sports Accessories", slug: "sports-accessories", icon: Bike },
    { name: "Books", slug: "books", icon: BookOpen },
    { name: "Beauty", slug: "beauty", icon: Sparkles },
    { name: "Fragrances", slug: "fragrances", icon: Wind },
    { name: "Skin Care", slug: "skin-care", icon: Sparkles },
    { name: "Baby & Kids", slug: "baby", icon: Baby },
    { name: "Automotive", slug: "automotive", icon: Car },
    { name: "Motorcycle", slug: "motorcycle", icon: Bike },
    { name: "Vehicle", slug: "vehicle", icon: Car },
    { name: "Groceries", slug: "groceries", icon: Utensils },
    { name: "Garden", slug: "garden", icon: Flower2 },
    { name: "Gaming", slug: "gaming", icon: Gamepad2 },
    { name: "Cameras", slug: "cameras", icon: Camera },
    { name: "Audio", slug: "audio", icon: Headphones },
    { name: "Mobile Accessories", slug: "mobile-accessories", icon: Smartphone },
    { name: "Gifts", slug: "gifts", icon: Gift },
    { name: "Jewelry", slug: "jewelry", icon: Gem },
    { name: "Health", slug: "health", icon: Pill },
    { name: "Pet Supplies", slug: "pets", icon: PawPrint },
    { name: "Art & Crafts", slug: "art", icon: Brush },
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
          const categoryProducts = products.filter(p => p.category === cat);
          return {
            id: index,
            name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
            slug: cat,
            image: product ? (product.thumbnail || product.images[0]) : "https://via.placeholder.com/300",
            productCount: categoryProducts.length
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
      discount: Math.round(p.discountPercentage),
      image: p.thumbnail || p.images[0],
      rating: p.rating,
      reviews: p.reviews ? p.reviews.length : 100,
      category: p.category
    }))
    : [];

  const getCategoryIcon = (slug) => {
    const cat = staticCategories.find(c => c.slug === slug);
    return cat ? cat.icon : Grid3X3;
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
          /* Categories Grid - Large Icon Cards */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apiCategories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="group bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 min-h-[220px]"
                >
                  <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-violet-100 transition-colors duration-300">
                    <IconComponent className="w-10 h-10 text-violet-600" />
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