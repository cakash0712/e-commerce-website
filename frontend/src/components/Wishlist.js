import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart, useWishlist } from "../App";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();


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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">{wishlistItems.length} items</p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.discount && (
                      <Badge className="bg-red-500 hover:bg-red-500">-{item.discount}%</Badge>
                    )}
                    {item.isNew && <Badge className="bg-green-500 hover:bg-green-500">New</Badge>}
                    {item.isBestSeller && <Badge className="bg-amber-500 hover:bg-amber-500">Best Seller</Badge>}
                  </div>
                  {/* Wishlist Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white/90 hover:bg-white"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">{renderStars(item.rating)}</div>
                    <span className="text-sm text-gray-500">({item.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">${item.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    onClick={() => addToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save items you love for later by clicking the heart icon.</p>
            <Link to="/shop">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;