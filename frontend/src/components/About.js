import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Heart,
  CheckCircle,
  Globe,
  Zap,
  Package,
  ArrowRight,
  Users,
  Award,
  Truck,
  Headphones,
  Star
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const About = () => {
  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "125+", label: "Brand Partners", icon: Award },
    { number: "99.9%", label: "Satisfaction Rate", icon: Star },
    { number: "24/7", label: "Customer Support", icon: Headphones },
  ];

  const values = [
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Every product undergoes rigorous quality checks before reaching you. We stand behind everything we sell."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We're committed to providing an exceptional shopping experience."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep. Track your orders in real-time."
    },
    {
      icon: Zap,
      title: "Best Prices",
      description: "We work directly with manufacturers to bring you the best prices without compromising quality."
    }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Verified Customer", quote: "ZippyCart has transformed my shopping experience. The quality and prices are unbeatable!", img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop" },
    { name: "Michael Chen", role: "Regular Shopper", quote: "Fast delivery and excellent customer service. I recommend ZippyCart to all my friends.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
    { name: "Emily Rodriguez", role: "Fashion Enthusiast", quote: "The product selection is amazing and the website is so easy to navigate. Love it!", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
    { name: "David Kim", role: "Tech Gadget Lover", quote: "Found all the latest gadgets at great prices. The return policy gave me peace of mind.", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-violet-50 to-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              About Us
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Redefining Online <span className="text-violet-600">Shopping</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              We're more than just an e-commerce platform. We're your trusted partner in finding quality products at amazing prices.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-violet-50 transition-colors">
                <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</h3>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"
                alt="Our Office"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-violet-600 text-white p-6 rounded-2xl shadow-xl hidden md:block">
                <p className="text-3xl font-bold">6+</p>
                <p className="text-sm opacity-90">Years of Excellence</p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Story
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Founded in 2018, ZippyCart began with a simple mission: make quality products accessible to everyone. What started as a small team with big dreams has grown into a trusted destination for thousands of customers.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We believe shopping should be enjoyable, not stressful. That's why we've built a platform that combines curated selections, competitive prices, and exceptional customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Verified Products</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Secure Payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We're committed to providing the best shopping experience possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-violet-200">
                <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say about their ZippyCart experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl hover:bg-violet-50 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.img}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-violet-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-violet-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-violet-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers and discover quality products at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button className="bg-white text-violet-600 hover:bg-gray-100 h-14 px-10 rounded-xl text-lg font-semibold transition-all">
                Explore Products <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-10 rounded-xl text-lg font-semibold transition-all">
                Contact Us
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