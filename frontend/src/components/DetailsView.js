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
    ArrowRight,
    ArrowLeft,
    Search
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
            "brand": { "@type": "Brand", "name": "DACHCart" },
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
                    originalPrice: p.originalPrice || (p.discount > 0 ? Math.round(p.price / (1 - p.discount / 100)) : p.price),
                    discount: p.discount,
                    special_offer_enabled: p.special_offer_enabled,
                    is_special_active: p.is_special_active,
                    is_offer_expired: p.is_offer_expired,
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
        if (product && product.id) {
            console.log("DetailsView: Adding to recently viewed:", product.id);
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
        <div className="min-h-screen bg-white flex flex-col pt-16 lg:pt-20 overflow-x-hidden">
            <Navigation />

            <main className="flex-1 overflow-x-hidden">
                {/* Breadcrumbs - Hidden on Mobile */}
                <div className="bg-white border-b border-gray-100 hidden sm:block">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1.5 hover:text-violet-600 transition-colors mr-2 group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                <span>Back</span>
                            </button>
                            <div className="w-px h-3 bg-gray-200 mx-2" />
                            <Link to="/" className="hover:text-violet-600">Home</Link>
                            <ChevronRight className="w-3 h-3 opacity-50" />
                            <Link to="/shop" className="hover:text-violet-600">Shop</Link>
                            <ChevronRight className="w-3 h-3 opacity-50" />
                            <Link to={`/shop?category=${product.category}`} className="hover:text-violet-600 capitalize">{product.category}</Link>
                            <ChevronRight className="w-3 h-3 opacity-50" />
                            <span className="text-gray-900 font-black truncate max-w-[200px]">{product.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Product Section */}
                <div className="bg-white w-full">
                    <div className="max-w-7xl mx-auto lg:px-8 py-0 lg:py-4">
                        {/* Mobile Header */}
                        <div className="lg:hidden px-4 pt-4 pb-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <Link
                                    to={`/shop?vendor=${product.vendor.id}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 rounded-md text-[9px] font-bold uppercase tracking-wider border border-violet-100"
                                >
                                    <Store className="w-2.5 h-2.5" />
                                    {product.vendor.name}
                                </Link>
                                <div className="flex gap-1.5">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-500 border border-slate-100"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({ title: product.name, text: product.description, url: window.location.href });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert("Link copied!");
                                            }
                                        }}
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border ${isInWishlist(product.id) ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                                        onClick={handleWishlistAction}
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center px-1 py-0.5 bg-violet-600 rounded text-[9px] font-bold text-white gap-1">
                                        <span>{product.rating}</span>
                                        <Star className="w-2.5 h-2.5 fill-white" />
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400">{product.reviewsCount} reviews</span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${product.stock > 10 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                    {product.stock > 10 ? 'In Stock' : `Low Stock (${product.stock})`}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-12 w-full overflow-x-hidden">
                            {/* Image Gallery */}
                            <div className="space-y-3 px-0 sm:px-4 lg:px-0 w-full overflow-x-hidden">
                                <div className="relative aspect-[4/3] lg:aspect-square bg-white sm:rounded-xl overflow-hidden lg:border lg:border-slate-100 flex items-center justify-center p-2 sm:p-4 max-h-[300px] lg:max-h-none">
                                    <img
                                        src={product.images && product.images.length > 0 ? getImageUrl(product.images[activeImage]) : getImageUrl(product.image)}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                                    />
                                    {product.discount > 0 && (
                                        <div className="absolute top-2 left-2 bg-slate-900 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                            {product.discount}% OFF
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 lg:hidden bg-white/70 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30">
                                        {product.images.map((_, i) => (
                                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${activeImage === i ? 'w-3 bg-violet-600' : 'w-1 bg-slate-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 px-4 sm:px-0 overflow-x-auto pb-1 scrollbar-none w-full">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative shrink-0 w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all p-0.5 ${activeImage === idx ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-slate-50'}`}
                                        >
                                            <img src={getImageUrl(img)} alt={`View ${idx + 1}`} className="w-full h-full object-contain" onError={(e) => { e.target.src = '/assets/zlogo.png'; }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Desktop View Header */}
                                <div className="hidden lg:block space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-violet-100 text-violet-700 border-none px-3 py-1 text-[10px] font-bold uppercase">{product.category}</Badge>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Product</span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                                            ))}
                                            <span className="text-sm font-bold text-slate-900 ml-1">{product.rating}</span>
                                        </div>
                                        <span className="text-sm text-violet-600 font-medium">{product.reviewsCount} reviews</span>
                                        <span className={`text-sm font-bold ${product.stock > 10 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {product.stock > 10 ? 'In Stock' : 'Low Stock'}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                                        {product.discount > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl text-slate-300 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                                <span className="text-emerald-500 font-bold text-sm">{product.discount}% OFF</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-500 leading-relaxed text-base">{product.description}</p>
                                </div>

                                {/* Mobile Specific Info */}
                                <div className="lg:hidden px-4 space-y-6">
                                    <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Selling Price</p>
                                            <div className="flex items-baseline gap-3 mb-4">
                                                <div className="text-4xl font-bold">₹{product.price.toLocaleString()}</div>
                                                {product.discount > 0 && (
                                                    <div className="text-emerald-400 text-sm font-bold">-{product.discount}% OFF</div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Shipping</p>
                                                    <p className="text-xs font-bold">{product.delivery_type === 'free' ? 'Free Delivery' : `₹${product.delivery_charge}`}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Returns</p>
                                                    <p className="text-xs font-bold">10 Day Replacement</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Features */}
                                    {product.features.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Features</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {product.features.slice(0, 4).map((f, i) => (
                                                    <div key={i} className="flex gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Check className="w-3.5 h-3.5 text-violet-600" />
                                                        <p className="text-xs font-medium text-slate-700">{f}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Info */}
                                <div className="hidden sm:grid grid-cols-2 gap-4 lg:grid-cols-1 xl:grid-cols-2 px-4 lg:px-0">
                                    <div className="p-4 flex items-start gap-4 bg-white border border-slate-100 rounded-2xl">
                                        <Truck className="w-5 h-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 mb-0.5">Delivery Info</p>
                                            <p className="text-[11px] text-slate-500">{product.delivery_type === 'free' ? 'Free Shipping' : `Charges Apply: ₹${product.delivery_charge}`}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center gap-4 bg-white border border-slate-100 rounded-2xl">
                                        <RotateCcw className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 mb-0.5">Return Policy</p>
                                            <p className="text-[11px] text-slate-500">10-day replacement policy</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Column */}
                            <div className="space-y-5 lg:sticky lg:top-24 h-fit px-4 lg:px-0">
                                {product.offers && (
                                    <div className="p-4 bg-violet-600 rounded-2xl text-white shadow-lg flex gap-3 items-start">
                                        <Zap className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-violet-200 mb-1">Product Offer</h4>
                                            <p className="text-xs font-bold leading-relaxed">{product.offers}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <Store className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Sold By</p>
                                        <Link to={`/shop?vendor=${product.vendor.id}`} className="text-sm font-bold text-slate-900 hover:text-violet-600 transition-colors">
                                            {product.vendor.name}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-bold">{product.vendor.rating}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Quantity</span>
                                        <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-100">
                                            <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="w-3 h-3" /></button>
                                            <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                                            <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pb-24 lg:pb-0">
                                        <Button
                                            onClick={() => addToCart({ ...product, quantity })}
                                            className="w-full h-14 bg-white border border-slate-900 text-slate-900 hover:bg-slate-50 text-sm font-bold rounded-2xl transition-all"
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            onClick={() => { addToCart({ ...product, quantity }); navigate('/cart'); }}
                                            className="w-full h-14 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl shadow-lg transition-all"
                                        >
                                            Buy Product Now
                                        </Button>
                                    </div>
                                </div>

                                {/* Mobile Sticky Bar */}
                                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-4 flex items-center gap-4 z-[100] lg:hidden shadow-lg animate-in slide-in-from-bottom duration-500">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 mb-0.5">Price</p>
                                        <p className="text-xl font-bold text-slate-900">₹{product.price.toLocaleString()}</p>
                                    </div>
                                    <Button
                                        onClick={() => { addToCart({ ...product, quantity }); navigate('/cart'); }}
                                        className="h-12 flex-1 bg-slate-900 text-white rounded-xl font-bold text-sm"
                                    >
                                        Go to Cart
                                    </Button>
                                </div>

                                {/* Desktop Only Trust Indicators */}
                                <div className="hidden lg:grid grid-cols-2 gap-3 pt-6">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Truck className="w-6 h-6 text-violet-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {product.delivery_type === 'free' ? 'Free Delivery' : `+ ₹${product.delivery_charge} extra`}
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

                {/* Tabs Section */}
                <div className="bg-white border-t border-slate-100 mt-8 font-sans">
                    <div className="max-w-7xl mx-auto px-4 lg:px-8">
                        <div className="border-b border-slate-100 overflow-x-auto scrollbar-none">
                            <nav className="flex gap-8 min-w-max">
                                {['description', 'reviews', 'specifications'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all capitalize ${activeTab === tab
                                            ? 'border-violet-600 text-violet-600'
                                            : 'border-transparent text-slate-400 hover:text-slate-900'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="py-10">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <p className="text-slate-600 leading-relaxed mb-8 text-base">{product.description}</p>
                                    <h3 className="text-lg font-bold text-slate-900 mb-5 uppercase tracking-wide">Main Highlights</h3>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {product.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <Check className="w-5 h-5 text-violet-600" />
                                                <span className="text-slate-700 font-medium text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Product Reviews</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{product.rating} / 5 Rating</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-widest text-[10px] px-6 py-5 rounded-xl transition-all"
                                        >
                                            Write Review
                                        </Button>
                                    </div>

                                    {showReviewForm && (
                                        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                            <div className="relative z-10">
                                                <h4 className="text-sm font-bold uppercase tracking-widest text-violet-400 mb-6">Your Review</h4>
                                                <div className="space-y-5">
                                                    <div>
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 block">Choose Rating</Label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setUserRating(star)}
                                                                    className="p-1 hover:scale-110 transition-transform"
                                                                >
                                                                    <Star className={`w-6 h-6 ${userRating >= star ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 block">Review Content</Label>
                                                        <Textarea
                                                            value={userComment}
                                                            onChange={(e) => setUserComment(e.target.value)}
                                                            placeholder="Tell us what you think about this product..."
                                                            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-violet-500"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleReviewSubmit}
                                                        disabled={!userComment}
                                                        className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-widest text-xs"
                                                    >
                                                        Submit Review
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.detailedReviews && product.detailedReviews.length > 0 ? (
                                            product.detailedReviews.map((rev, i) => (
                                                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                                                {(rev.user_name || rev.user || "A").charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{rev.user_name || rev.user || "User"}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">
                                                                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : (rev.date || "Just now")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <div className="flex gap-0.5">
                                                                {[...Array(5)].map((_, j) => (
                                                                    <Star key={j} className={`w-2.5 h-2.5 ${j < (rev.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                                                                ))}
                                                            </div>
                                                            {rev.verified && (
                                                                <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase border border-emerald-100 px-1.5 py-0 rounded">Verified Purchase</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{rev.comment || rev.review_text || ""}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No reviews yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="grid md:grid-cols-2 gap-x-12 gap-y-1">
                                    {[
                                        { label: "Brand", value: product.brand },
                                        { label: "Category", value: product.category },
                                        { label: "Weight", value: product.weight },
                                        { label: "Dimensions", value: product.dimensions },
                                        { label: "Material", value: product.material },
                                        { label: "Warranty", value: product.warranty },
                                        { label: "Box Contents", value: product.box_contents },
                                    ].map((spec, i) => (
                                        <div key={i} className="flex justify-between py-4 border-b border-slate-50 group">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{spec.label}</span>
                                            <span className="font-bold text-slate-900 text-sm group-hover:text-violet-600 transition-colors">{spec.value || 'N/A'}</span>
                                        </div>
                                    ))}
                                    {Object.entries(product.specifications || {}).map(([key, value], i) => (
                                        <div key={`tech-${i}`} className="flex justify-between py-4 border-b border-slate-50 group">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{key}</span>
                                            <span className="font-bold text-slate-900 text-sm group-hover:text-violet-600 transition-colors uppercase">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="bg-slate-50 py-16 border-t border-slate-100">
                        <div className="max-w-7xl mx-auto px-4 lg:px-8">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                                <div className="space-y-2">
                                    <Badge className="bg-violet-600 text-white border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Recommended</Badge>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Similar Products</h2>
                                </div>
                                <Link
                                    to={`/shop?category=${product.category}`}
                                    className="inline-flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-[10px] hover:text-violet-600 transition-all"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-0">
                                {relatedProducts.map((p) => (
                                    <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
                                        <div className="aspect-square bg-white overflow-hidden relative p-4 flex items-center justify-center">
                                            <img
                                                src={getImageUrl(p.image)}
                                                alt={p.name}
                                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                                            />
                                            {p.discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-{p.discount}%</div>
                                            )}
                                        </div>
                                        <div className="p-4 border-t border-slate-50">
                                            <h4 className="font-bold text-slate-900 text-[11px] sm:text-xs line-clamp-1 mb-2 group-hover:text-violet-600 transition-colors">{p.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-slate-900">₹{p.price.toLocaleString()}</span>
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all">
                                                    <ArrowRight className="w-4 h-4" />
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
