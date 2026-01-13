import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "../App";
import {
  ShoppingBag,
  Star,
  Heart,
  ArrowRight,
  ChevronLeft,
  Grid3X3,
  Plus
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Categories = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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
          const productCount = products.filter(p => p.category === cat).length;
          return {
            id: index,
            name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
            slug: cat,
            image: product ? (product.thumbnail || product.images[0]) : "https://via.placeholder.com/300",
            productCount: productCount
          };
        });
        setCategories(categoryObjects);
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-b from-violet-50 to-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to All Categories
              </button>
            )}

            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Grid3X3 className="w-4 h-4" />
              {selectedCategory ? selectedCategory.name : "All Categories"}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              {selectedCategory ? selectedCategory.name : "Shop by Category"}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {selectedCategory
                ? `Explore our collection of ${selectedCategory.name.toLowerCase()} products.`
                : "Browse our curated categories to find exactly what you're looking for."}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-500 font-medium">Loading categories...</p>
          </div>
        ) : !selectedCategory ? (
          /* Categories Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-4">
                      {category.productCount} Products
                    </p>
                    <div className="flex items-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                  className="mt-6 bg-violet-600 hover:bg-violet-700 rounded-lg"
                >
                  Browse Other Categories
                </Button>
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