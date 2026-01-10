import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "../App";
import {
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  X,
} from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-md shadow-lg border-b border-gray-200 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              ShopVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {["Home", "Shop", "Categories", "Deals", "About"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-violet-600"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/search">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100 relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {["Home", "Shop", "Categories", "Deals", "About"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="block py-2 text-gray-700 hover:text-violet-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;