import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    Facebook,
    Twitter,
    Instagram,
    Sparkles,
    Zap,
    Info,
    Store
} from "lucide-react";
import { useCart, useWishlist } from "../App";
import Navigation from "./Navigation";
import Footer from "./Footer";

import { Helmet } from 'react-helmet-async';

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

    const handleReviewSubmit = () => {
        alert("Your review protocol has been successfully authenticated and queued for global synchronization.");
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
            "brand": {
                "@type": "Brand",
                "name": "ZippyCart"
            },
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
                const productRes = await axios.get(`https://dummyjson.com/products/${id}`);
                const p = productRes.data;

                const mappedProduct = {
                    id: p.id,
                    name: p.title,
                    price: Math.round(p.price * 83),
                    originalPrice: Math.round(p.price * 83 * (1 + p.discountPercentage / 100)),
                    discount: Math.round(p.discountPercentage),
                    description: p.description,
                    images: p.images || [p.thumbnail],
                    category: p.category,
                    rating: p.rating,
                    reviewsCount: p.reviews ? p.reviews.length : Math.floor(Math.random() * 500) + 100,
                    stock: p.stock || Math.floor(Math.random() * 50) + 10,
                    vendor: {
                        name: "Zippy Global Partners",
                        id: "v-123",
                        rating: 4.8
                    },
                    delivery: "Delivered by Friday, Oct 24",
                    returnPolicy: "Easy 30-day return & exchange policy",
                    features: [
                        "Premium Grade Materials",
                        "Ergonomic Design",
                        "Certified Quality",
                        "2-Year Warranty"
                    ],
                    detailedReviews: [
                        { user: "Arjun K.", rating: 5, date: "2 days ago", comment: "Exceptional quality! Exactly what I was looking for. The delivery was lightning fast too." },
                        { user: "Sneha M.", rating: 4, date: "1 week ago", comment: "Very good product. The build quality feels premium. Small lag in customer support but product is 10/10." },
                        { user: "Raj P.", rating: 5, date: "2 weeks ago", comment: "Great value for money. The packaging was very secure." }
                    ]
                };

                setProduct(mappedProduct);

                try {
                    const categoryRes = await axios.get(`https://dummyjson.com/products/category/${p.category}?limit=10`);
                    const related = categoryRes.data.products
                        .filter(item => item.id !== parseInt(id))
                        .map(item => ({
                            id: item.id,
                            name: item.title,
                            price: Math.round(item.price * 83),
                            image: item.thumbnail,
                            rating: item.rating
                        }))
                        .slice(0, 4);
                    setRelatedProducts(related);
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
            <div className="min-h-screen bg-white flex flex-col pt-32">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-medium tracking-tight uppercase text-xs font-black">Decrypting Product Data...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex flex-col pt-32">
                <Navigation />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <Info className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Product Not Found</h2>
                    <p className="text-gray-500 mb-8 max-w-md font-medium">{error || "The product you're looking for doesn't exist."}</p>
                    <Button onClick={() => navigate('/shop')} className="bg-gray-900 hover:bg-violet-600 text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                        Back to Shop
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col pt-20">
            <Helmet>
                <title>{`${product.name} | ZippyCart Official`}</title>
                <meta name="description" content={product.description} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description} />
                <meta property="og:image" content={product.images[0]} />
                <meta property="og:type" content="product" />
                <script type="application/ld+json">
                    {JSON.stringify(getJsonLd())}
                </script>
            </Helmet>
            <Navigation />

            <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-10">
                    <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/shop" className="hover:text-violet-600 transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-violet-600 truncate max-w-[150px]">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-12 gap-12 xl:gap-20 items-start">

                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                        <div className="relative aspect-square sm:aspect-video lg:aspect-square xl:aspect-video rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-2xl group">
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Image Badges */}
                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                <Badge className="bg-violet-600 text-white border-none font-black text-[10px] px-4 py-2 rounded-full uppercase shadow-2xl">Zippy Choice</Badge>
                                {product.discount > 0 && (
                                    <Badge className="bg-amber-400 text-black border-none font-black text-[10px] px-4 py-2 rounded-full uppercase shadow-2xl">-{product.discount}% OFF</Badge>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            {product.images.length > 1 && (
                                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-2xl bg-white/90 w-12 h-12 shadow-2xl hover:bg-white"
                                        onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-2xl bg-white/90 w-12 h-12 shadow-2xl hover:bg-white"
                                        onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${activeImage === idx ? 'border-violet-600' : 'border-transparent hover:border-violet-100'}`}
                                >
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                    {activeImage !== idx && <div className="absolute inset-0 bg-white/40" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-10 text-left">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-violet-50 text-violet-600 border-none font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest">{product.category}</Badge>
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{product.rating} ({product.reviewsCount} Reviews)</span>
                                </div>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-900 tracking-tighter italic">₹{product.price.toLocaleString()}</span>
                                    <span className="text-lg text-gray-400 line-through font-bold">₹{product.originalPrice.toLocaleString()}</span>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] px-3 py-1 rounded-lg uppercase">Save ₹{(product.originalPrice - product.price).toLocaleString()}</Badge>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                <Store className="w-5 h-5 text-violet-600" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Sold By</p>
                                    <Link to={`/shop?vendor=${product.vendor.id}`} className="text-sm font-black text-gray-900 hover:text-violet-600 transition-colors">{product.vendor.name}</Link>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{product.vendor.rating} ★ Rating</p>
                                </div>
                            </div>

                            <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <Separator className="bg-gray-100" />

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery</p>
                                        <p className="text-sm font-bold text-gray-900">{product.delivery}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Returns</p>
                                        <p className="text-sm font-bold text-gray-900">{product.returnPolicy}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-violet-600">Select Quantity</Label>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock < 10 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                                        {product.stock < 10 ? `Only ${product.stock} Left!` : `In Stock: ${product.stock} Units`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 border-2 border-transparent focus-within:border-violet-100 transition-all">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-gray-500 hover:text-violet-600 rounded-xl"
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        >
                                            -
                                        </Button>
                                        <span className="w-12 text-center font-black text-xl text-gray-900">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-gray-500 hover:text-violet-600 rounded-xl"
                                            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Button
                                    onClick={() => addToCart({ ...product, quantity })}
                                    className="w-full sm:flex-1 h-16 bg-gray-950 hover:bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </Button>
                                <Button
                                    onClick={() => {
                                        addToCart({ ...product, quantity });
                                        navigate('/payment');
                                    }}
                                    className="w-full sm:flex-1 h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Zap className="w-5 h-5 text-amber-300" />
                                    Buy Now
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                    className={`h-16 w-16 rounded-2xl border-4 shrink-0 transition-all ${isInWishlist(product.id) ? 'border-pink-200 bg-pink-50 text-pink-500' : 'border-gray-50 text-gray-300 hover:text-violet-600 hover:border-violet-100'}`}
                                >
                                    <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        {/* Enhanced Trust Bar */}
                        <div className="grid grid-cols-2 gap-4 pt-10">
                            <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">100% Secure Checkout</span>
                            </div>
                            <div className="p-5 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-blue-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">Original & Authentic</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews & Social Section */}
                <div className="grid lg:grid-cols-3 gap-12 mt-32">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Badge className="bg-violet-50 text-violet-600 border-none font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">Reviews</Badge>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Customer Voice.</h2>
                            </div>
                            <Button
                                variant={showReviewForm ? "ghost" : "outline"}
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="rounded-xl border-2 font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-all"
                            >
                                {showReviewForm ? "Decline Submission" : "Initialize Review"}
                            </Button>
                        </div>

                        {showReviewForm && (
                            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gray-900 p-10 text-white animate-in zoom-in duration-300">
                                <div className="space-y-8">
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-2xl font-black italic uppercase">Feedback <span className="text-violet-400">Authorization.</span></h3>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Your insight improves our global inventory integrity.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Experience Rating</Label>
                                            <div className="flex gap-3 justify-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setUserRating(star)}
                                                        className={`p-2 rounded-xl transition-all ${userRating >= star ? 'bg-violet-600 shadow-lg shadow-violet-900/50 scale-110' : 'bg-white/5 grayscale opacity-30 hover:opacity-100 hover:bg-white/10'}`}
                                                    >
                                                        <Star className={`w-8 h-8 ${userRating >= star ? 'fill-white text-white' : 'text-gray-400'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Commentary Dispatch</Label>
                                            <Textarea
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                placeholder="Document your professional experience with this asset..."
                                                className="min-h-[140px] bg-white/5 border-white/10 rounded-2xl p-6 font-medium text-lg focus:border-violet-400 focus:ring-violet-400/20 text-white"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleReviewSubmit}
                                            disabled={!userComment}
                                            className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-violet-900/40 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <Sparkles className="w-5 h-5 text-amber-300" />
                                            Synchronize Review
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <div className="space-y-6">
                            {product.detailedReviews.map((rev, i) => (
                                <Card key={i} className="border-none shadow-sm bg-gray-50/50 rounded-3xl p-8 transition-all hover:bg-white hover:shadow-xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                                                {rev.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{rev.user}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rev.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} className={`w-3.5 h-3.5 ${j < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 font-medium leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="space-y-1">
                            <Badge className="bg-violet-50 text-violet-600 border-none font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">Specifications</Badge>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Identity.</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: "Material", val: "Premium Composition" },
                                { title: "Origin", val: "Global Standard" },
                                { title: "Warranty", val: "2 Year Core Protection" },
                                { title: "SKU", val: `ZIP-${product.id}-ALPHA` }
                            ].map((spec, i) => (
                                <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-white border border-gray-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{spec.title}</span>
                                    <span className="text-sm font-black text-gray-900 italic uppercase">{spec.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 rounded-[2.5rem] bg-gray-950 text-white space-y-6 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Share with Circle</p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Share2].map((Icon, i) => (
                                    <Button key={i} size="icon" variant="outline" className="w-12 h-12 rounded-2xl border-white/10 hover:bg-white hover:text-black transition-all">
                                        <Icon className="w-5 h-5" />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <section className="mt-32 pb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="text-left space-y-1">
                            <Badge className="bg-violet-50 text-violet-600 border-none font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">Recommendations</Badge>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Match <span className="text-violet-600">Perfect.</span></h2>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-indigo-600 transition-all">
                            Explore Catalog <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map((p) => (
                            <Link key={p.id} to={`/product/${p.id}`} className="group relative bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2">
                                <div className="aspect-square overflow-hidden relative rounded-[2rem] border border-gray-50 shadow-sm">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button className="rounded-2xl bg-white text-gray-950 hover:bg-white font-black uppercase tracking-widest text-[10px]">Quick View</Button>
                                    </div>
                                </div>
                                <div className="p-6 text-left">
                                    <h4 className="font-black text-gray-900 truncate group-hover:text-violet-600 transition-colors uppercase tracking-tight text-sm mb-1">{p.name}</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-gray-900 italic text-lg tracking-tighter">₹{p.price.toLocaleString()}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="text-[10px] font-black text-gray-400">{p.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default DetailsView;
