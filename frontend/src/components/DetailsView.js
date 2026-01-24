import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    ShoppingCart,
    Heart,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Share2,
    Check,
    Minus,
    Plus,
    Zap,
    Info,
    Store,
    Package,
    Clock,
    Award
} from "lucide-react";
import { useCart, useWishlist } from "../App";
import Navigation from "./Navigation";
import Footer from "./Footer";

const DetailsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [activeTab, setActiveTab] = useState('description');

    // Helper function to get proxied image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/assets/zlogo.png';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        }
        return imageUrl;
    };

    const handleReviewSubmit = () => {
        alert("Thank you for your review! It will be published after verification.");
        setShowReviewForm(false);
        setUserComment('');
        setUserRating(5);
    };

    const getJsonLd = () => {
        if (!product) return null;
        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images,
            "description": product.description,
            "brand": { "@type": "Brand", "name": "ZippyCart" },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "INR",
                "price": product.price,
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviewsCount
            }
        };
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                const productRes = await axios.get(`${API_BASE}/api/products/${id}`);
                const p = productRes.data;

                const mappedProduct = {
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.discount > 0 ? Math.round(p.price / (1 - p.discount / 100)) : p.price,
                    discount: p.discount,
                    description: p.description,
                    images: p.images && p.images.length > 0 ? [p.image, ...p.images] : [p.image],
                    category: p.category,
                    rating: p.rating || 0,
                    reviewsCount: p.reviews ? p.reviews.length : 0,
                    stock: p.stock,
                    brand: p.brand || "Generic",
                    offers: p.offers || "",
                    weight: p.weight || "N/A",
                    dimensions: p.dimensions || "N/A",
                    material: p.material || "N/A",
                    warranty: p.warranty || "N/A",
                    box_contents: p.box_contents || "N/A",
                    specifications: p.specifications || {},
                    vendor: {
                        name: p.vendor_name || "ZippyCart Vendor",
                        id: p.vendor_id,
                        rating: 4.8
                    },
                    features: p.highlights && p.highlights.length > 0 ? p.highlights : [
                        "Premium Quality Materials",
                        "Ergonomic Design",
                        "Quality Certified",
                        "2-Year Warranty"
                    ],
                    detailedReviews: [
                        { user: "Arjun K.", rating: 5, date: "2 days ago", comment: "Exceptional quality! Exactly what I was looking for. The delivery was lightning fast too.", verified: true },
                        { user: "Sneha M.", rating: 4, date: "1 week ago", comment: "Very good product. The build quality feels premium. Small lag in customer support but product is 10/10.", verified: true },
                        { user: "Raj P.", rating: 5, date: "2 weeks ago", comment: "Great value for money. The packaging was very secure.", verified: false }
                    ]
                };

                setProduct(mappedProduct);

                try {
                    const relatedRes = await axios.get(`${API_BASE}/api/products?category=${productRes.data.category}&limit=4&exclude=${id}`);
                    setRelatedProducts(relatedRes.data);
                } catch (catErr) {
                    console.error("Error fetching related products:", catErr);
                }

            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Product data could not be retrieved.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col pt-20">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500">Loading product...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex flex-col pt-20">
                <Navigation />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <Info className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-8">{error || "The product you're looking for doesn't exist."}</p>
                    <Button onClick={() => navigate('/shop')} className="bg-violet-600 hover:bg-violet-700 text-white">
                        Back to Shop
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
            <Navigation />

            <main className="flex-1">
                {/* Breadcrumbs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <nav className="flex items-center gap-2 text-sm text-gray-500">
                            <Link to="/" className="hover:text-violet-600">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link to="/shop" className="hover:text-violet-600">Shop</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link to={`/shop?category=${product.category}`} className="hover:text-violet-600 capitalize">{product.category}</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Product Section */}
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={product.images && product.images.length > 0 ? getImageUrl(product.images[activeImage]) : getImageUrl(product.image)}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.src = '/assets/zlogo.png'; // Fallback image
                                        }}
                                    />
                                    {product.discount > 10 && (
                                        <Badge className="absolute top-4 left-4 bg-rose-500 text-white border-none font-bold">
                                            -{product.discount}% OFF
                                        </Badge>
                                    )}
                                    {/* Navigation Arrows */}
                                    {product.images.length > 1 && (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
                                                onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
                                                onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-violet-600' : 'border-gray-200 hover:border-violet-300'}`}
                                        >
                                            <img src={getImageUrl(img)} alt={`View ${idx + 1}`} className="w-full h-full object-contain bg-gray-50" onError={(e) => { e.target.src = '/assets/zlogo.png'; }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                <div>
                                    <Badge className="bg-violet-100 text-violet-700 border-none mb-3 capitalize">{product.category}</Badge>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                                    {/* Rating */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-violet-600 font-medium">{product.rating} ({product.reviewsCount} reviews)</span>
                                        <span className="text-sm text-gray-400">|</span>
                                        <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : 'text-rose-600'}`}>
                                            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-3 mb-4">
                                        <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                        {product.discount > 0 && (
                                            <>
                                                <span className="text-xl text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                                <Badge className="bg-green-100 text-green-700 border-none">
                                                    Save ₹{(product.originalPrice - product.price).toLocaleString()}
                                                </Badge>
                                            </>
                                        )}
                                    </div>

                                    {product.offers && (
                                        <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-violet-700 mb-2 uppercase tracking-wide">
                                                <Zap className="w-4 h-4 fill-violet-700" /> Available Offers
                                            </h4>
                                            <p className="text-sm text-gray-700 font-medium">{product.offers}</p>
                                        </div>
                                    )}

                                    <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                                </div>

                                {/* Vendor Info */}
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <Store className="w-5 h-5 text-violet-600" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-0.5">Sold by</p>
                                        <p className="text-sm font-semibold text-gray-900">{product.vendor.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="font-medium">{product.vendor.rating}</span>
                                    </div>
                                </div>

                                {/* Quantity & Actions */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Label className="text-sm font-medium text-gray-700">Quantity:</Label>
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 hover:bg-gray-100"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="w-12 text-center font-semibold">{quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 hover:bg-gray-100"
                                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={() => addToCart({ ...product, quantity })}
                                            className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            onClick={() => { addToCart({ ...product, quantity }); navigate('/payment'); }}
                                            className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                                        >
                                            <Zap className="w-5 h-5 mr-2" />
                                            Buy Now
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                            className={`h-12 w-12 border-2 ${isInWishlist(product.id) ? 'border-rose-300 bg-rose-50 text-rose-500' : 'border-gray-300 hover:border-violet-300 hover:text-violet-600'}`}
                                        >
                                            <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Trust Features */}
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Truck className="w-5 h-5 text-violet-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                                            <p className="text-xs text-gray-500">On orders over ₹500</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <RotateCcw className="w-5 h-5 text-violet-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                                            <p className="text-xs text-gray-500">10-day return policy</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-violet-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                                            <p className="text-xs text-gray-500">100% secure checkout</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Award className="w-5 h-5 text-violet-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Genuine Product</p>
                                            <p className="text-xs text-gray-500">Brand authorized</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white border-t border-gray-200 mt-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-8">
                                {['description', 'reviews', 'specifications'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                                            ? 'border-violet-600 text-violet-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="py-8">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-gray-600">
                                                <Check className="w-5 h-5 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="border-violet-300 text-violet-600 hover:bg-violet-50"
                                        >
                                            Write a Review
                                        </Button>
                                    </div>

                                    {showReviewForm && (
                                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-4">Your Review</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm text-gray-700 mb-2 block">Rating</Label>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={() => setUserRating(star)}
                                                                className="p-1"
                                                            >
                                                                <Star className={`w-6 h-6 ${userRating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-sm text-gray-700 mb-2 block">Comment</Label>
                                                    <Textarea
                                                        value={userComment}
                                                        onChange={(e) => setUserComment(e.target.value)}
                                                        placeholder="Share your experience with this product..."
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleReviewSubmit}
                                                    disabled={!userComment}
                                                    className="bg-violet-600 hover:bg-violet-700 text-white"
                                                >
                                                    Submit Review
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {product.detailedReviews.map((rev, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold">
                                                            {rev.user.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{rev.user}</p>
                                                            <p className="text-xs text-gray-500">{rev.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {rev.verified && (
                                                            <Badge className="bg-green-100 text-green-700 text-xs border-none">Verified</Badge>
                                                        )}
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, j) => (
                                                                <Star key={j} className={`w-3 h-3 ${j < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600">{rev.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="space-y-4">
                                    {[
                                        { label: "Brand", value: product.brand },
                                        { label: "Category", value: product.category },
                                        { label: "SKU", value: `ZC-${product.id.substring(0, 8)}` },
                                        { label: "Weight", value: product.weight },
                                        { label: "Dimensions", value: product.dimensions },
                                        { label: "Material", value: product.material },
                                        { label: "Warranty", value: product.warranty },
                                        { label: "Box Contents", value: product.box_contents },
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-500">{spec.label}</span>
                                            <span className="font-medium text-gray-900 capitalize">{spec.value}</span>
                                        </div>
                                    ))}
                                    {Object.entries(product.specifications).map(([key, value], i) => (
                                        <div key={`tech-${i}`} className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-500">{key}</span>
                                            <span className="font-medium text-gray-900 capitalize">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="bg-gray-50 py-12">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
                                <Link to={`/shop?category=${product.category}`} className="text-sm text-violet-600 hover:underline font-medium">
                                    View All
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {relatedProducts.map((p) => (
                                    <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all">
                                        <div className="aspect-square bg-gray-50 overflow-hidden">
                                            <img src={p.image || '/assets/zlogo.png'} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = '/assets/zlogo.png'; }} />
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-violet-600 transition-colors mb-2">{p.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                                                    {p.discount > 0 && (
                                                        <span className="text-[10px] text-gray-400 line-through">₹{Math.round(p.price / (1 - p.discount / 100)).toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                    <span className="text-xs text-gray-500">{p.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default DetailsView;
