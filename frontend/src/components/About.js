import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Star,
  Heart,
  Search,
  Menu,
  X,
  User,
  Users,
  Award,
  Truck,
  Shield,
  Headphones,
  Target,
  Eye,
  Heart as HeartIcon,
  CheckCircle,
  Quote,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Import Navigation and Footer from App.js or create shared components
// For now, duplicate Navigation and Footer here

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component (duplicated from App.js)
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100"
            >
              <Heart className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-gray-100"
            >
              <User className="w-5 h-5" />
            </Button>
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

// Footer Component (duplicated from App.js)
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ShopVerse</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Your one-stop destination for premium products at unbeatable
              prices.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "Shop", "Categories", "Deals", "About Us"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              {[
                "Contact Us",
                "FAQs",
                "Shipping Info",
                "Returns & Exchanges",
                "Track Order",
              ].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>123 Commerce St, New York, NY</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>support@shopverse.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 ShopVerse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// About Page Component
const About = () => {
  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "10K+", label: "Products Sold" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Customer Support" },
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide exceptional shopping experiences with premium products, unbeatable prices, and outstanding customer service.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To become the world's most trusted online marketplace, connecting customers with quality products from around the globe.",
    },
    {
      icon: HeartIcon,
      title: "Our Values",
      description: "Integrity, innovation, customer-centricity, and sustainability guide everything we do at ShopVerse.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Emily Davis",
      role: "Head of Customer Experience",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "David Wilson",
      role: "VP of Operations",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-6">
            About ShopVerse
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Revolutionizing Online Shopping
          </h1>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            Founded in 2020, ShopVerse has been at the forefront of e-commerce innovation,
            providing millions of customers with access to premium products and exceptional service.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold text-violet-600 mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">Our Story</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                From Vision to Reality
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  ShopVerse began as a simple idea: to create an online shopping experience
                  that puts customers first. Our founders recognized the need for a platform
                  that combines quality products, competitive pricing, and exceptional customer service.
                </p>
                <p>
                  Starting from a small warehouse in New York, we've grown into a global
                  marketplace serving customers worldwide. Our commitment to innovation and
                  customer satisfaction has been the driving force behind our success.
                </p>
                <p>
                  Today, ShopVerse offers thousands of products across multiple categories,
                  with a focus on sustainability, ethical sourcing, and community impact.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=600&h=400&fit=crop"
                alt="Our story"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our Values</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our core values shape every decision we make and guide our interactions with customers and partners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our Team</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet the People Behind ShopVerse
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our diverse team of experts is passionate about creating the best shopping experience for our customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-violet-600 text-sm">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Our Commitment to You
          </h2>
          <p className="text-white/80 text-lg max-w-3xl mx-auto mb-8">
            We're committed to providing you with the best possible shopping experience.
            From product quality to customer service, we strive for excellence in everything we do.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Quality Guarantee</h3>
              <p className="text-white/80">Every product meets our high standards</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Fast Shipping</h3>
              <p className="text-white/80">Quick and reliable delivery worldwide</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-white/80">Always here when you need us</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Shop with Us?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join millions of satisfied customers and experience the ShopVerse difference today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Start Shopping
              </Button>
            </Link>
            <Link to="/categories">
              <Button size="lg" variant="outline">
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;