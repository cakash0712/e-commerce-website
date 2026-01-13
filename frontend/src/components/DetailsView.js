import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
    Info
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

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                // Fetch current product
                const productRes = await axios.get(`https://dummyjson.com/products/${id}`);
                const p = productRes.data;

                const mappedProduct = {
                    id: p.id,
                    name: p.title,
                    price: Math.round(p.price * 83),
                    originalPrice: Math.round(p.price * 83 * (1 + p.discountPercentage / 100)),
                    description: p.description,
                    images: p.images || [p.thumbnail],
                    category: p.category,
                    rating: p.rating,
                    reviews: p.reviews ? p.reviews.length : Math.floor(Math.random() * 500) + 100,
                    stock: Math.floor(Math.random() * 50) + 10,
                    features: [
                        "Premium Grade Materials",
                        "Ergonomic Design",
                        "Certified Quality",
                        "2-Year Warranty"
                    ]
                };

                setProduct(mappedProduct);

                // Fetch related products from same category
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
                        <p className="text-gray-500 font-medium">Loading product details...</p>
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-8 max-w-md">{error || "The product you're looking for doesn't exist."}</p>
                    <Button onClick={() => navigate('/shop')} className="bg-gray-900 hover:bg-violet-600 text-white rounded-xl px-8">
                        Back to Shop
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col pt-20">
            <Navigation />

            <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-8">
                    <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/shop" className="hover:text-violet-600 transition-colors">Shop</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-violet-600 truncate max-w-[150px]">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-start">

                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Image Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                <Badge className="bg-violet-600 text-white border-none font-bold text-[10px] px-3 py-1 rounded-full uppercase">Premium Choice</Badge>
                                <Badge className="bg-black/80 text-white border-none font-bold text-[10px] px-3 py-1 rounded-full uppercase">Limited Stock</Badge>
                            </div>

                            {/* Navigation Arrows */}
                            {product.images.length > 1 && (
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full bg-white/90 w-10 h-10 shadow-md hover:bg-white"
                                        onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="rounded-full bg-white/90 w-10 h-10 shadow-md hover:bg-white"
                                        onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-3">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-violet-600' : 'border-transparent hover:border-violet-100'}`}
                                >
                                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="lg:col-span-6 space-y-8 text-left">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] px-3 py-1 rounded-full uppercase">{product.category}</Badge>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">({product.reviews} Reviews)</span>
                                </div>
                            </div>

                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-gray-900 italic">₹{product.price.toLocaleString()}</span>
                                <span className="text-base text-gray-400 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-2 py-0.5 rounded-lg uppercase">Save 20%</Badge>
                            </div>

                            <p className="text-gray-600 font-medium text-base leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <Separator className="bg-gray-100" />

                        <div className="space-y-6">
                            {/* Features List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-violet-400 ml-1">Quantity</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-gray-400 hover:text-violet-600"
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        >
                                            -
                                        </Button>
                                        <span className="w-10 text-center font-bold text-base">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 text-gray-400 hover:text-violet-600"
                                            onClick={() => setQuantity(q => q + 1)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-500">Available: {product.stock} Units</p>
                                </div>
                            </div>

                            {/* Main Actions Aligned in a Single Row */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button
                                    onClick={() => addToCart({ ...product, quantity })}
                                    className="flex-1 h-14 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </Button>
                                <Button
                                    onClick={() => {
                                        addToCart({ ...product, quantity });
                                        navigate('/payment');
                                    }}
                                    className="flex-1 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-violet-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    Buy Now
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                    className={`h-14 w-14 rounded-xl border-2 shrink-0 transition-all ${isInWishlist(product.id) ? 'border-pink-200 bg-pink-50 text-pink-500' : 'border-gray-100 text-gray-300 hover:text-violet-600 hover:border-violet-100'}`}
                                >
                                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="grid grid-cols-3 gap-3 pt-6">
                            {[
                                { icon: Truck, label: "Fast Shipping" },
                                { icon: ShieldCheck, label: "Secure Payment" },
                                { icon: RotateCcw, label: "Easy Returns" }
                            ].map((trust, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-violet-600 border border-gray-100">
                                        <trust.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase text-gray-400">{trust.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <section className="mt-16 space-y-10">
                    <div className="text-center space-y-2">
                        <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] px-4 py-1 rounded-full uppercase">Details</Badge>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight italic">Product <span className="text-violet-600">Overview.</span></h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Material", value: "Premium Composition" },
                            { title: "Design", value: "Modern Minimalist" },
                            { title: "Quality", value: "Certified Standard" },
                            { title: "Catalog ID", value: `${product.id}` }
                        ].map((spec, i) => (
                            <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <p className="text-[9px] font-bold uppercase text-violet-400 mb-1">{spec.title}</p>
                                <p className="text-base font-bold text-gray-900">{spec.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Related Products */}
                <section className="mt-20 pb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div className="text-left space-y-2">
                            <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] px-3 py-1 rounded-full uppercase">Recommendations</Badge>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight italic">Similar in <span className="text-violet-600 capitalize">{product.category}.</span></h2>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-1 text-[10px] font-bold uppercase text-violet-600 hover:text-indigo-600 transition-all">
                            See All Shop <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.length > 0 ? (
                            relatedProducts.map((p) => (
                                <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all block border border-gray-50">
                                    <div className="aspect-square overflow-hidden relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 text-left">
                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors text-sm">{p.name}</h4>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-bold text-gray-900 text-sm">₹{p.price.toLocaleString()}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                                <span className="text-[10px] font-bold text-gray-400">{p.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-400 font-medium">No related products found in this category.</div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default DetailsView;
