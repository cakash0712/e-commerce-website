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
    ArrowLeft
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
        <div className="min-h-screen bg-gray-50 flex flex-col pt-32 sm:pt-20">
            <Navigation />

            <main className="flex-1">
                {/* Breadcrumbs - Hidden on Mobile for cleaner look, shown on tablet+ */}
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
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 lg:py-8">
                        {/* Mobile Header (Brand, Title, Rating) - Only visible on Mobile */}
                        {/* Mobile Modern Header */}
                        <div className="lg:hidden px-4 pt-6 pb-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Link
                                    to={`/shop?vendor=${product.vendor.id}`}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-100/50"
                                >
                                    <Store className="w-3 h-3" />
                                    {product.vendor.name} Store
                                </Link>
                                <div className="flex gap-1.5">
                                    <button
                                        className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 active:scale-95 transition-all"
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({ title: product.name, text: product.description, url: window.location.href });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert("Link copied!");
                                            }
                                        }}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        className={`w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-all ${isInWishlist(product.id) ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-500'}`}
                                        onClick={handleWishlistAction}
                                    >
                                        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-xl font-black text-gray-900 leading-[1.2] tracking-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center px-1.5 py-0.5 bg-violet-600 rounded text-[10px] font-black text-white gap-1">
                                        <span>{product.rating}</span>
                                        <Star className="w-2.5 h-2.5 fill-white" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{product.reviewsCount} Reviews</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${product.stock > 10 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {product.stock > 10 ? 'Available in Hub' : `Only ${product.stock} Units Left`}
                                </span>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <div className="relative aspect-square bg-white lg:rounded-lg overflow-hidden lg:border lg:border-gray-100 flex items-center justify-center p-4">
                                    <img
                                        src={product.images && product.images.length > 0 ? getImageUrl(product.images[activeImage]) : getImageUrl(product.image)}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                                        onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                                    />
                                    {/* Mobile Floating Badge */}
                                    {product.discount > 0 && (
                                        <div className="absolute top-4 left-4 bg-gray-900 border border-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-2xl lg:hidden animate-in slide-in-from-left duration-500">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[14px] font-black leading-none">{product.discount}%</span>
                                                <span className="text-[7px] font-black uppercase tracking-widest text-violet-400">OFFSET</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Desktop Badge */}
                                    {product.discount > 10 && (
                                        <Badge className="absolute top-4 left-4 bg-rose-500 text-white border-none font-bold hidden lg:flex">
                                            -{product.discount}% OFF
                                        </Badge>
                                    )}
                                    {/* Navigation Indicators (Mobile) */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                                        {product.images.map((_, i) => (
                                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === i ? 'w-4 bg-violet-600' : 'w-1.5 bg-gray-300'}`} />
                                        ))}
                                    </div>
                                    {/* Navigation Arrows (Desktop) */}
                                    {product.images.length > 1 && (
                                        <div className="hidden lg:block">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md w-10 h-10"
                                                onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md w-10 h-10"
                                                onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
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
                                        {product.delivery_type !== 'free' && (
                                            <span className="text-xl font-bold text-slate-400">+ ₹{product.delivery_charge} <span className="text-[10px] uppercase tracking-tighter">Charges</span></span>
                                        )}
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
                                {/* Mobile Modern Pricing & Details */}
                                <div className="lg:hidden px-4 space-y-6">
                                    <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/30 rounded-full blur-[60px] -mr-16 -mt-16" />
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">Authorized Price Node</p>
                                            <div className="flex items-end gap-3 mb-2">
                                                <div className="text-5xl font-black italic tracking-tighter">₹{product.price.toLocaleString()}</div>
                                                {product.discount > 0 && (
                                                    <div className="text-xl text-emerald-400 font-bold mb-1">-{product.discount}% OFF</div>
                                                )}
                                            </div>
                                            {product.discount > 0 && (
                                                <p className="text-xs font-medium text-white/40 uppercase tracking-widest italic leading-none mb-6">
                                                    Original Artifact: <span className="line-through">₹{product.originalPrice.toLocaleString()}</span>
                                                </p>
                                            )}
                                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Delivery Protocol</p>
                                                    <p className="text-xs font-bold text-white uppercase">{product.delivery_type === 'free' ? 'Offset (Free)' : `₹${product.delivery_charge}`}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Return Window</p>
                                                    <p className="text-xs font-bold text-white uppercase">10-Day Sync</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Highlights Card */}
                                    {product.features.length > 0 && (
                                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Core Specifications</h4>
                                            <div className="space-y-3">
                                                {product.features.slice(0, 5).map((f, i) => (
                                                    <div key={i} className="flex gap-3 items-start group">
                                                        <div className="w-5 h-5 bg-violet-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                            <Check className="w-3 h-3 text-violet-600 stroke-[4]" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700 leading-snug">{f}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Delivery & Return Policy */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm">
                                    <div className="p-3.5 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                            <Truck className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-gray-900">
                                                {product.delivery_type === 'free' ? 'FREE delivery' : `+ ₹${product.delivery_charge} extra`}
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
                                <div className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm mx-4 lg:mx-0">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-100">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Authenticated Source</p>
                                        <Link
                                            to={`/shop?vendor=${product.vendor.id}`}
                                            className="text-sm font-black text-gray-900 hover:text-violet-600 transition-colors italic tracking-tight"
                                        >
                                            {product.vendor.name}
                                        </Link>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="font-black text-xs">{product.vendor.rating}</span>
                                        </div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified</p>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                {/* Actions Section */}
                                <div className="space-y-4 pt-4 lg:pt-2">
                                    <div className="flex items-center justify-between lg:justify-start lg:gap-6 px-4 lg:px-0">
                                        <Label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Inventory Sync</Label>
                                        <div className="flex items-center bg-gray-100 rounded-2xl p-1 border-2 border-gray-50">
                                            <button
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-violet-600 active:scale-90 transition-all"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center text-sm font-black text-gray-900">{quantity}</span>
                                            <button
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-violet-600 active:scale-90 transition-all"
                                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 lg:gap-4 px-4 lg:px-0 mb-24 lg:mb-0">
                                        <Button
                                            onClick={() => addToCart({ ...product, quantity })}
                                            className="w-full h-16 lg:h-14 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-violet-200 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                                        >
                                            <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Add to System
                                        </Button>
                                        <Button
                                            onClick={() => { addToCart({ ...product, quantity }); navigate('/cart'); }}
                                            className="w-full h-16 lg:h-14 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
                                        >
                                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            Initialize Transaction
                                        </Button>
                                    </div>
                                </div>

                                {/* Mobile Dynamic Bottom Bar (Sticky) */}
                                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 flex items-center gap-3 z-[100] lg:hidden animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
                                    <div className="flex-1 flex flex-col justify-center gap-0.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">Terminal Price</p>
                                        <p className="text-xl font-black text-gray-900 italic tracking-tighter leading-none">₹{product.price.toLocaleString()}</p>
                                    </div>
                                    <Button
                                        onClick={() => addToCart({ ...product, quantity })}
                                        className="h-14 bg-gray-900 hover:bg-black text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
                                    >
                                        Add Cart
                                    </Button>
                                    <Button
                                        onClick={() => { addToCart({ ...product, quantity }); navigate('/payment'); }}
                                        className="h-14 bg-violet-600 hover:bg-violet-700 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-violet-200 active:scale-95 transition-all"
                                    >
                                        Buy Now
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
                <div className="bg-white border-t border-gray-200 mt-6 font-sans">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-8">
                                {['description', 'reviews', 'specifications'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all capitalize ${activeTab === tab
                                            ? 'border-violet-600 text-violet-600'
                                            : 'border-transparent text-gray-400 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="py-12">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <p className="text-gray-600 leading-relaxed mb-10 text-lg">{product.description}</p>
                                    <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Technical Highlights</h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {product.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <Check className="w-5 h-5 text-violet-600" />
                                                <span className="text-gray-700 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Customer Feedback</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-gray-500">{product.rating} Average Rating</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-xs px-8 py-6 rounded-xl shadow-lg shadow-violet-100"
                                        >
                                            Post Review
                                        </Button>
                                    </div>

                                    {showReviewForm && (
                                        <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                                            <div className="relative z-10">
                                                <h4 className="text-lg font-black uppercase tracking-widest text-violet-400 mb-6">Write Artifact Review</h4>
                                                <div className="space-y-6">
                                                    <div>
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Rating Protocol</Label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setUserRating(star)}
                                                                    className="p-1 hover:scale-110 transition-transform"
                                                                >
                                                                    <Star className={`w-8 h-8 ${userRating >= star ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Transmission Content</Label>
                                                        <Textarea
                                                            value={userComment}
                                                            onChange={(e) => setUserComment(e.target.value)}
                                                            placeholder="Describe your experience with this unit..."
                                                            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-violet-500 focus:border-violet-500"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleReviewSubmit}
                                                        disabled={!userComment}
                                                        className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest"
                                                    >
                                                        Submit Transmission
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {product.detailedReviews && product.detailedReviews.length > 0 ? (
                                            product.detailedReviews.map((rev, i) => (
                                                <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center font-black uppercase shadow-sm">
                                                                {(rev.user_name || rev.user || "A").charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 italic tracking-tight">{rev.user_name || rev.user || "Anonymous"}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                                    {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : (rev.date || "Recently")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, j) => (
                                                                    <Star key={j} className={`w-3 h-3 ${j < (rev.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-100'}`} />
                                                                ))}
                                                            </div>
                                                            {rev.verified && (
                                                                <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 px-2 py-0.5">Verified</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{rev.comment || rev.review_text || ""}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-16 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Transmissions Recorded Yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
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
                                        <div key={i} className="flex justify-between py-4 border-b border-gray-100 group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{spec.label}</span>
                                            <span className="font-bold text-gray-900 capitalize group-hover:text-violet-600 transition-colors">{spec.value}</span>
                                        </div>
                                    ))}
                                    {Object.entries(product.specifications).map(([key, value], i) => (
                                        <div key={`tech-${i}`} className="flex justify-between py-4 border-b border-gray-100 group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{key}</span>
                                            <span className="font-bold text-gray-900 capitalize group-hover:text-violet-600 transition-colors">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="bg-gray-50 py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                                <div className="space-y-2">
                                    <Badge className="bg-violet-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-violet-200">Recommended Sync</Badge>
                                    <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">More From {product.category}</h2>
                                </div>
                                <Link
                                    to={`/shop?category=${product.category}`}
                                    className="inline-flex items-center gap-3 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                                >
                                    View Repository <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((p) => (
                                    <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all">
                                        <div className="aspect-square bg-gray-50 overflow-hidden relative">
                                            <img
                                                src={p.image || '/assets/zlogo.png'}
                                                alt={p.name}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                                                onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                                            />
                                            {p.discount > 0 && (
                                                <div className="absolute top-4 left-4 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg">-{p.discount}%</div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-violet-600 transition-colors mb-4 min-h-[40px] leading-tight">{p.name}</h4>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-lg text-gray-900">₹{p.price.toLocaleString()}</span>
                                                    {p.discount > 0 && (
                                                        <span className="text-[10px] text-gray-400 line-through">₹{Math.round(p.price / (1 - p.discount / 100)).toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all">
                                                    <ArrowRight className="w-5 h-5" />
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
