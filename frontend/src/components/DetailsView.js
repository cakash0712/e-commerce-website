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
    Award,
    ArrowRight
} from "lucide-react";
import { useAuth, useCart, useWishlist, useRecentlyViewed } from "../App";
import Navigation from "./Navigation";
import Footer from "./Footer";

const DetailsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToRecentlyViewed } = useRecentlyViewed();

    const handleWishlistAction = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
    };

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

    const handleReviewSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Please login to submit a review.");
                navigate('/login');
                return;
            }

            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            await axios.post(`${API_BASE}/api/reviews`, {
                product_id: id,
                rating: userRating,
                comment: userComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Thank you for your review! It will be published after verification.");
            setShowReviewForm(false);
            setUserComment('');
            setUserRating(5);

            // Refresh product details to show the new review (if it's instantly public)
            // Or just manually fetch reviews again if possible.
            // For now, let's just re-fetch the product.
            const productRes = await axios.get(`${API_BASE}/api/products/${id}`);
            const p = productRes.data;
            const mappedProduct = {
                ...product,
                detailedReviews: p.reviews || []
            };
            setProduct(mappedProduct);

        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Failed to submit review. Please try again later.");
        }
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
                    features: p.highlights && p.highlights.length > 0 ? p.highlights : [],
                    reviews: p.reviews || [],
                    vendor: {
                        name: p.vendor?.business_name || p.vendor_name || "Unknown Vendor",
                        id: p.vendor?.business_id || p.vendor_id,
                        rating: p.vendor?.business_rating ?? 0,
                        reviewsCount: p.vendor?.business_reviews_count || 0
                    },
                    detailedReviews: p.reviews || [],
                    delivery_type: p.delivery_type || "free",
                    delivery_charge: p.delivery_charge || 0,
                    free_delivery_above: p.free_delivery_above || 0
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

    // Tracking Recently Viewed
    useEffect(() => {
        if (product) {
            addToRecentlyViewed({
                id: product.id,
                name: product.name,
                image: getImageUrl(product.images?.[0] || product.image),
                price: product.price
            });
        }
    }, [product, addToRecentlyViewed]);

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
            <div className="min-h-screen bg-gray-50 flex flex-col pt-20">
                <Navigation />
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
                    {/* Main Content Card */}
                    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                        {/* Illustration */}
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full"></div>
                            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
                                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                            Product Unavailable
                        </h1>
                        <p className="text-gray-500 text-base md:text-lg mb-2">
                            The product you requested could not be found.
                        </p>
                        <p className="text-gray-400 text-sm mb-8">
                            {error || "This item may have been removed, is out of stock, or the URL is incorrect."}
                        </p>

                        {/* Search Box */}
                        <div className="max-w-md mx-auto mb-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for products, brands and more"
                                    className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            navigate(`/shop?search=${encodeURIComponent(e.target.value.trim())}`);
                                        }
                                    }}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                            <Button
                                onClick={() => navigate('/shop')}
                                className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-8 rounded-lg font-medium shadow-sm"
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-8 rounded-lg font-medium"
                            >
                                Go to Homepage
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 pt-8">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                                Browse Popular Categories
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {['Electronics', 'Fashion', 'Home', 'Beauty', 'Grocery'].map((cat) => (
                                    <Link
                                        key={cat}
                                        to={`/shop?category=${cat}`}
                                        className="px-4 py-2 bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-600 text-sm font-medium rounded-full border border-gray-100 hover:border-violet-200 transition-all"
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Help Text */}
                    <p className="mt-8 text-sm text-gray-400">
                        Need help? <Link to="/contact" className="text-violet-600 hover:underline font-medium">Contact our support team</Link>
                    </p>
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 lg:py-8">
                        {/* Mobile Header (Brand, Title, Rating) - Only visible on Mobile */}
                        <div className="lg:hidden pt-4 pb-2 space-y-1">
                            <div className="flex justify-between items-start">
                                <Link
                                    to={`/shop?vendor=${product.vendor.id}`}
                                    className="text-[13px] font-medium text-violet-600 hover:underline"
                                >
                                    Visit the {product.vendor.name} Store
                                </Link>
                                <div className="flex gap-2">
                                    <button
                                        className="p-1 text-gray-500 hover:text-violet-600 transition-colors"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: product.name,
                                                    text: product.description,
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert("Link copied to clipboard!");
                                            }
                                        }}
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        className={`p-1 transition-colors ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-500'}`}
                                        onClick={handleWishlistAction}
                                    >
                                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-[17px] font-normal text-gray-900 leading-snug">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-violet-600 text-violet-600' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <span className="text-[13px] text-violet-600 font-medium">{product.rating}</span>
                                <span className="text-[13px] text-gray-500">({product.reviewsCount})</span>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative aspect-square bg-white rounded-lg overflow-hidden lg:border lg:border-gray-100 flex items-center justify-center p-4">
                                    <img
                                        src={product.images && product.images.length > 0 ? getImageUrl(product.images[activeImage]) : getImageUrl(product.image)}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                                        onError={(e) => {
                                            e.target.src = '/assets/zlogo.png'; // Fallback image
                                        }}
                                    />
                                    {/* Mobile Floating Badge */}
                                    {product.discount > 10 && (
                                        <div className="absolute top-0 left-0 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-br-2xl shadow-lg lg:hidden">
                                            {product.discount}% OFF
                                        </div>
                                    )}
                                    {/* Desktop Badge */}
                                    {product.discount > 10 && (
                                        <Badge className="absolute top-4 left-4 bg-rose-500 text-white border-none font-bold hidden lg:flex">
                                            -{product.discount}% OFF
                                        </Badge>
                                    )}
                                    {/* Navigation Arrows */}
                                    {product.images.length > 1 && (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md w-8 h-8 lg:w-10 lg:h-10"
                                                onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                            >
                                                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md w-8 h-8 lg:w-10 lg:h-10"
                                                onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                            >
                                                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-violet-600' : 'border-gray-100 hover:border-violet-300'}`}
                                        >
                                            <img src={getImageUrl(img)} alt={`View ${idx + 1}`} className="w-full h-full object-contain bg-gray-50" onError={(e) => { e.target.src = '/assets/zlogo.png'; }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Desktop Title/Category */}
                                <div className="hidden lg:block space-y-4">
                                    <Badge className="bg-violet-100 text-violet-700 border-none capitalize">{product.category}</Badge>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                                    <div className="flex items-center gap-3">
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
                                    <div className="flex items-baseline gap-3">
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
                                    <p className="text-gray-600 leading-relaxed text-sm lg:text-base">{product.description}</p>
                                </div>

                                {/* Mobile Specific View Elements */}
                                <div className="lg:hidden space-y-6">
                                    {/* Mobile Pricing */}
                                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-[28px] font-light text-gray-900">₹{product.price.toLocaleString()}</span>
                                            {product.discount > 0 && (
                                                <span className="text-2xl text-rose-600 font-light">-{product.discount}%</span>
                                            )}
                                        </div>
                                        {product.discount > 0 && (
                                            <p className="text-[13px] text-gray-500">
                                                M.R.P.: <span className="line-through">₹{product.originalPrice.toLocaleString()}</span>
                                            </p>
                                        )}
                                        <p className="text-[13px] text-gray-900 mt-1">Inclusive of all taxes</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex items-center gap-1 text-[13px] font-bold text-emerald-700">
                                                <Check className="w-4 h-4" /> In Stock
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile About This Item */}
                                    {product.features.length > 0 && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <h4 className="text-[15px] font-bold text-gray-900 mb-2">About this item</h4>
                                            <ul className="space-y-2 lg:space-y-1.5 pl-4 list-disc marker:text-gray-300">
                                                {product.features.slice(0, 4).map((f, i) => (
                                                    <li key={i} className="text-[13px] text-gray-700 leading-normal">{f}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Mobile Delivery & Return Policy */}
                                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm">
                                        <div className="p-3.5 flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                                <Truck className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-bold text-gray-900">
                                                    {product.delivery_type === 'free' ? 'FREE delivery' : `Delivery: ₹${product.delivery_charge}`}
                                                </p>
                                                <p className="text-[13px] text-gray-500">
                                                    {product.delivery_type === 'free' && product.free_delivery_above > 0
                                                        ? `on orders over ₹${product.free_delivery_above}`
                                                        : 'Handled by ZippyCart Logistics'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-3.5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                                <RotateCcw className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <p className="text-[14px] text-gray-900 font-medium">10 days Replacement</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Common Sections (Vendor & Actions) */}
                                <div className="space-y-4 pt-2 lg:pt-0">
                                    {product.offers && (
                                        <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 shadow-sm">
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-violet-700 mb-2 uppercase tracking-wide">
                                                <Zap className="w-4 h-4 fill-violet-700" /> Available Offers
                                            </h4>
                                            <p className="text-sm text-gray-700 font-medium">{product.offers}</p>
                                        </div>
                                    )}

                                    {/* Vendor Info Section */}
                                    <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                            <Store className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[11px] text-gray-500 mb-0.5 leading-none uppercase font-bold tracking-wider">Sold by</p>
                                            <Link
                                                to={`/shop?vendor=${product.vendor.id}`}
                                                className="text-sm font-bold text-gray-900 hover:text-violet-600 transition-colors"
                                            >
                                                {product.vendor.name}
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-100 shadow-sm">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-[13px]">{product.vendor.rating}</span>
                                        </div>
                                    </div>

                                    {/* Actions Section */}
                                    <div className="space-y-4 pt-4 lg:pt-2">
                                        <div className="flex items-center justify-between lg:justify-start lg:gap-6">
                                            <Label className="text-sm lg:text-base font-bold text-gray-900">Quantity</Label>
                                            <div className="flex items-center bg-gray-100/80 rounded-[12px] p-1 border border-gray-200">
                                                <button
                                                    className="w-10 h-10 lg:w-9 lg:h-9 flex items-center justify-center text-gray-500 hover:text-black active:scale-90 transition-all"
                                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center text-[15px] font-black text-gray-900">{quantity}</span>
                                                <button
                                                    className="w-10 h-10 lg:w-9 lg:h-9 flex items-center justify-center text-gray-500 hover:text-black active:scale-90 transition-all"
                                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 lg:gap-4">
                                            <Button
                                                onClick={() => addToCart({ ...product, quantity })}
                                                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[15px] rounded-2xl shadow-xl shadow-violet-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Add to Cart
                                            </Button>
                                            <Button
                                                onClick={() => { addToCart({ ...product, quantity }); navigate('/payment'); }}
                                                className="w-full h-14 bg-[#131921] hover:bg-black text-white font-bold text-[15px] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                                                Buy Now
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Desktop Only Trust Indicators */}
                                    <div className="hidden lg:grid grid-cols-2 gap-3 pt-6">
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Truck className="w-6 h-6 text-violet-600" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {product.delivery_type === 'free' ? 'Free Delivery' : `Delivery: ₹${product.delivery_charge}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {product.delivery_type === 'free' && product.free_delivery_above > 0
                                                        ? `On orders over ₹${product.free_delivery_above}`
                                                        : "Standard shipping applied"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <RotateCcw className="w-6 h-6 text-violet-600" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Easy Returns</p>
                                                <p className="text-xs text-gray-500">10-day replacement policy</p>
                                            </div>
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
                                        {product.detailedReviews && product.detailedReviews.length > 0 ? (
                                            product.detailedReviews.map((rev, i) => (
                                                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-semibold uppercase">
                                                                {(rev.user_name || rev.user || "A").charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{rev.user_name || rev.user || "Anonymous"}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : (rev.date || "Recently")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {rev.verified && (
                                                                <Badge className="bg-green-100 text-green-700 text-xs border-none">Verified</Badge>
                                                            )}
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, j) => (
                                                                    <Star key={j} className={`w-3 h-3 ${j < (rev.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600">{rev.comment || rev.review_text || ""}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                <p>No reviews yet. Be the first to review this product!</p>
                                            </div>
                                        )}
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
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <Badge className="bg-violet-100 text-violet-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">More From</Badge>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{product.category}</h2>
                                </div>
                                <Link to={`/shop?category=${product.category}`} className="text-violet-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 group bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
