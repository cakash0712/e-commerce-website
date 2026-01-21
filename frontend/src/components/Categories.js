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

  // Static categories with icons and logos mapped to API slugs
  const staticCategories = [
    { name: "Electronics", slug: "electronics", icon: Laptop, logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center" },
    { name: "Laptops", slug: "laptops", icon: Laptop, logo: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop&crop=center" },
    { name: "Smartphones", slug: "smartphones", icon: Smartphone, logo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&crop=center" },
    { name: "Tablets", slug: "tablets", icon: Tablet, logo: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop&crop=center" },
    { name: "Fashion", slug: "fashion", icon: Shirt, logo: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop&crop=center" },
    { name: "Mens Shirts", slug: "mens-shirts", icon: Shirt, logo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop&crop=center" },
    { name: "Mens Shoes", slug: "mens-shoes", icon: Footprints, logo: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop&crop=center" },
    { name: "Womens Dresses", slug: "womens-dresses", icon: ShoppingBag, logo: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop&crop=center" },
    { name: "Womens Shoes", slug: "womens-shoes", icon: Footprints, logo: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop&crop=center" },
    { name: "Tops", slug: "tops", icon: Shirt, logo: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop&crop=center" },
    { name: "Accessories", slug: "accessories", icon: Watch, logo: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&h=200&fit=crop&crop=center" },
    { name: "Womens Watches", slug: "womens-watches", icon: Watch, logo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&crop=center" },
    { name: "Mens Watches", slug: "mens-watches", icon: Watch, logo: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=200&h=200&fit=crop&crop=center" },
    { name: "Sunglasses", slug: "sunglasses", icon: Sun, logo: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop&crop=center" },
    { name: "Womens Bags", slug: "womens-bags", icon: ShoppingBag, logo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop&crop=center" },
    { name: "Womens Jewellery", slug: "womens-jewellery", icon: Gem, logo: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop&crop=center" },
    { name: "Home & Decor", slug: "home-decoration", icon: HomeIcon, logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center" },
    { name: "Furniture", slug: "furniture", icon: Bed, logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center" },
    { name: "Kitchen Accessories", slug: "kitchen-accessories", icon: Utensils, logo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&crop=center" },
    { name: "Sports & Fitness", slug: "sports", icon: Dumbbell, logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center" },
    { name: "Sports Accessories", slug: "sports-accessories", icon: Bike, logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center" },
    { name: "Books", slug: "books", icon: BookOpen, logo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&crop=center" },
    { name: "Beauty", slug: "beauty", icon: Sparkles, logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop&crop=center" },
    { name: "Fragrances", slug: "fragrances", icon: Wind, logo: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&h=200&fit=crop&crop=center" },
    { name: "Skin Care", slug: "skin-care", icon: Sparkles, logo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop&crop=center" },
    { name: "Baby & Kids", slug: "baby", icon: Baby, logo: "https://images.unsplash.com/photo-1544569226-44165ff6e324?w=200&h=200&fit=crop&crop=center" },
    { name: "Automotive", slug: "automotive", icon: Car, logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center" },
    { name: "Motorcycle", slug: "motorcycle", icon: Bike, logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center" },
    { name: "Vehicle", slug: "vehicle", icon: Car, logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center" },
    { name: "Groceries", slug: "groceries", icon: Utensils, logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&crop=center" },
    { name: "Garden", slug: "garden", icon: Flower2, logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&crop=center" },
    { name: "Gaming", slug: "gaming", icon: Gamepad2, logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop&crop=center" },
    { name: "Cameras", slug: "cameras", icon: Camera, logo: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop&crop=center" },
    { name: "Audio", slug: "audio", icon: Headphones, logo: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=200&h=200&fit=crop&crop=center" },
    { name: "Mobile Accessories", slug: "mobile-accessories", icon: Smartphone, logo: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop&crop=center" },
    { name: "Gifts", slug: "gifts", icon: Gift, logo: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop&crop=center" },
    { name: "Jewelry", slug: "jewelry", icon: Gem, logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop&crop=center" },
    { name: "Health", slug: "health", icon: Pill, logo: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop&crop=center" },
    { name: "Pet Supplies", slug: "pets", icon: PawPrint, logo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&crop=center" },
    { name: "Art & Crafts", slug: "art", icon: Brush, logo: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center" },
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

  const getCategoryInfo = (slug) => {
    const cat = staticCategories.find(c => c.slug === slug);
    return cat ? { icon: cat.icon, logo: cat.logo } : { icon: Grid3X3, logo: "https://via.placeholder.com/200x200?text=Category" };
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
          /* Categories Grid - Logo Images */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apiCategories.map((cat) => {
              const { icon: IconComponent, logo } = getCategoryInfo(cat.slug);
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