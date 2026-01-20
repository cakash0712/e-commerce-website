import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Heart,
  CheckCircle,
  Globe,
  Zap,
  ArrowRight,
  Users,
  Award,
  Truck,
  Headphones,
  Star,
  Package,
  Clock,
  MapPin
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// About Page - Professional Formal Violet Style
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
      description: "Every product undergoes rigorous quality checks before reaching you."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep across India."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority with hassle-free returns."
    },
    {
      icon: Zap,
      title: "Best Prices",
      description: "We work directly with manufacturers for the best prices."
    }
  ];

  const milestones = [
    { year: "2018", title: "Company Founded", desc: "Started with a vision to make quality products accessible" },
    { year: "2020", title: "10K+ Customers", desc: "Reached our first major customer milestone" },
    { year: "2022", title: "Pan-India Delivery", desc: "Expanded delivery to all major cities" },
    { year: "2024", title: "50K+ Customers", desc: "Celebrating 50,000+ happy customers" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-white pt-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-violet-50 skew-x-[-20deg] translate-x-1/2 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <nav className="text-sm text-gray-400 mb-6">
              <Link to="/" className="hover:text-violet-600">Home</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">About Us</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Elevating the Future of <br />
              <span className="text-violet-600">Digital Commerce</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl">
              We're dedicated to bridging the gap between quality products and conscious consumers through a seamless, brand-focused shopping experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 h-14 rounded-xl text-lg shadow-lg shadow-violet-200">
                  Explore Products <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 px-10 h-14 rounded-xl text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mx-auto mb-6">
                  <stat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square bg-violet-600 rounded-[3rem] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-cover mix-blend-multiply opacity-80"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-violet-100 rounded-full blur-3xl -z-10" />
            </div>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-sm font-bold uppercase tracking-wider">
                Our Story
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Driven by passion, defined by <span className="text-violet-600">purpose</span>.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded in 2018, our journey began with a simple yet powerful goal: to create a platform where quality meets convenience. We believe that everyone deserves access to authentic, high-quality products without compromise.
              </p>
              <div className="space-y-4">
                {[
                  "Curated selection of global brands",
                  "Ethical sourcing and logistics",
                  "Customer-centric return policy",
                  "Secure and encrypted payments"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-violet-600" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Core Values</h2>
            <p className="text-violet-100 text-lg">
              The principles that guide us every day in building a better shopping experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-violet-100 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Journey So Far</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
            <div className="space-y-12">
              {milestones.map((item, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 text-center md:text-right w-full">
                    {i % 2 === 0 && (
                      <div>
                        <span className="text-violet-600 font-bold text-xl">{item.year}</span>
                        <h4 className="text-lg font-bold text-gray-900 mt-1">{item.title}</h4>
                        <p className="text-gray-500 mt-2">{item.desc}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-4 h-4 rounded-full bg-violet-600 border-4 border-white shadow-[0_0_0_4px_rgba(124,58,237,0.1)] z-10" />
                  <div className="flex-1 text-center md:text-left w-full">
                    {i % 2 === 1 && (
                      <div>
                        <span className="text-violet-600 font-bold text-xl">{item.year}</span>
                        <h4 className="text-lg font-bold text-gray-900 mt-1">{item.title}</h4>
                        <p className="text-gray-500 mt-2">{item.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Experience Quality?</h2>
          <p className="text-gray-500 text-lg mb-10">
            Join thousands of happy customers who trust us for their daily essentials and lifestyle products.
          </p>
          <Link to="/shop">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-12 h-14 rounded-xl text-lg shadow-lg shadow-violet-200">
              Go to Store
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;