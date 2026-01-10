import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useCart, useWishlist } from "../App";
import { Search as SearchIcon, Star, ShoppingCart, Heart, Filter, SlidersHorizontal, X } from "lucide-react";

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    color: [],
    size: [],
    priceRange: [0, 2000],
    rating: 0,
    sortBy: 'relevance'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [trendingSearches] = useState(['wireless headphones', 'smart watch', 'gaming laptop', 'running shoes']);
  const [recentSearches] = useState(['bluetooth speaker', 'yoga mat']);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const mockProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 128,
      discount: 20,
      isNew: true,
      category: "Electronics",
      brand: "Sony",
      color: "Black",
      size: "One Size"
    },
    {
      id: 2,
      name: "Smart Watch Pro",
      price: 299.99,
      originalPrice: 399.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 89,
      discount: 25,
      isBestSeller: true,
      category: "Electronics",
      brand: "Apple",
      color: "Silver",
      size: "42mm"
    },
    {
      id: 3,
      name: "Gaming Laptop Ultra",
      price: 1299.99,
      originalPrice: 1499.99,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 67,
      discount: 13,
      category: "Electronics",
      brand: "Dell",
      color: "Black",
      size: "15.6 inch"
    },
    {
      id: 4,
      name: "Comfortable Running Shoes",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 245,
      discount: 25,
      category: "Sports",
      brand: "Nike",
      color: "Blue",
      size: "10"
    },
    {
      id: 5,
      name: "Stylish Leather Jacket",
      price: 149.99,
      originalPrice: 199.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 156,
      discount: 25,
      category: "Fashion",
      brand: "Levi's",
      color: "Blue",
      size: "32"
    },
    {
      id: 6,
      name: "Organic Coffee Beans",
      price: 24.99,
      originalPrice: 29.99,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
      rating: 4.9,
      reviews: 78,
      discount: 17,
      category: "Food",
      brand: "Starbucks",
      color: "N/A",
      size: "1kg"
    },
    {
      id: 7,
      name: "Bluetooth Speaker",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 203,
      discount: 20,
      category: "Electronics",
      brand: "JBL",
      color: "Red",
      size: "One Size"
    },
    {
      id: 8,
      name: "Yoga Mat Premium",
      price: 49.99,
      originalPrice: 69.99,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 134,
      discount: 29,
      category: "Sports",
      brand: "YogaPro",
      color: "Purple",
      size: "Standard"
    },
    {
      id: 9,
      name: "Casual Denim Jeans",
      price: 79.99,
      originalPrice: 109.99,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      rating: 4.2,
      reviews: 89,
      discount: 27,
      category: "Fashion",
      brand: "Wrangler",
      color: "Blue",
      size: "32"
    },
    {
      id: 10,
      name: "Green Tea Pack",
      price: 14.99,
      originalPrice: 19.99,
      image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 156,
      discount: 25,
      category: "Food",
      brand: "Lipton",
      color: "Green",
      size: "100 bags"
    },
    {
      id: 11,
      name: "Wireless Mouse",
      price: 39.99,
      originalPrice: 49.99,
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 78,
      discount: 20,
      isNew: true,
      category: "Electronics",
      brand: "Logitech",
      color: "Black",
      size: "One Size"
    },
    {
      id: 12,
      name: "Tennis Racket",
      price: 129.99,
      originalPrice: 159.99,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 67,
      discount: 19,
      category: "Sports",
      brand: "Wilson",
      color: "Black",
      size: "27 inch"
    },
  ];

  const categories = ["Electronics", "Sports", "Fashion", "Food"];
  const brands = [...new Set(mockProducts.map(p => p.brand))];
  const colors = [...new Set(mockProducts.map(p => p.color))];
  const sizes = [...new Set(mockProducts.map(p => p.size))];
  const trendingProducts = mockProducts.slice(0, 8);
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' }
  ];

  const handleSearch = () => {
    let filtered = query ? mockProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    ) : [];

    // Apply filters
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => filters.category.includes(product.category));
    }
    if (filters.brand.length > 0) {
      filtered = filtered.filter(product => filters.brand.includes(product.brand));
    }
    if (filters.color.length > 0) {
      filtered = filtered.filter(product => filters.color.includes(product.color));
    }
    if (filters.size.length > 0) {
      filtered = filtered.filter(product => filters.size.includes(product.size));
    }
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );
    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // relevance - keep original order
        break;
    }

    setResults(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [query, filters]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-amber-400/50 text-amber-400" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Products</h1>
          <div className="flex gap-4 max-w-2xl">
            <Input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="text-lg"
            />
            <Button onClick={handleSearch} size="lg">
              <SearchIcon className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          {/* Trending Searches */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Trending Searches</h2>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(search)}
                  className="rounded-full"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery(search)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {search}
                    <X className="w-3 h-3 ml-1" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Sort Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              <span className="text-sm text-gray-600">
                {results.length} results {query && `for "${query}"`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-categories"
                        checked={!filters.category}
                        onCheckedChange={() => setFilters({...filters, category: ''})}
                      />
                      <label htmlFor="all-categories" className="text-sm">All Categories</label>
                    </div>
                    {categories.map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={cat}
                          checked={filters.category === cat}
                          onCheckedChange={(checked) => setFilters({...filters, category: checked ? cat : ''})}
                        />
                        <label htmlFor={cat} className="text-sm">{cat}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters({...filters, priceRange: value})}
                      max={2000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <Select value={filters.rating.toString()} onValueChange={(value) => setFilters({...filters, rating: parseFloat(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>
          )}

          {/* Search Results */}
          <div className="flex-1">
            {results.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.discount && (
                          <Badge className="bg-red-500 hover:bg-red-500">-{product.discount}%</Badge>
                        )}
                        {product.isNew && <Badge className="bg-green-500 hover:bg-green-500">New</Badge>}
                        {product.isBestSeller && <Badge className="bg-amber-500 hover:bg-amber-500">Best Seller</Badge>}
                      </div>
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className={`rounded-full bg-white/90 hover:bg-white ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
                          onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(product.rating)}</div>
                        <span className="text-sm text-gray-500">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-600">Enter a product name or keyword to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;