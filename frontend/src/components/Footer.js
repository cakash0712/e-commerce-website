import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  Smartphone,
  Apple,
  Play,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-0 shrink-0 mb-6 -ml-4">
              <img
                src="/assets/zlogo1.png"
                alt="ZippyCart Logo"
                className="w-40 h-16 object-contain"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your one-stop destination for premium products at unbeatable
              prices. Elevate your lifestyle with Zippy.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
                { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { icon: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" }
              ].map((social, i) => (
                <Button key={i} variant="ghost" size="icon" className="w-9 h-9 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Navigation</h3>
            <ul className="space-y-4">
              {["Home", "Shop", "Categories", "Deals", "About"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link === "About" ? "About Us" : link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Services</h3>
            <ul className="space-y-4">
              {[
                { label: "Contact Us", to: "/contact" },
                { label: "FAQs", to: "/faq" },
                { label: "Shipping Info", to: "/shipping" },
                { label: "Returns", to: "/returns" },
                { label: "Track Order", to: "/track-order" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App Coming Soon */}
          <div className="lg:col-span-2 bg-white/5 rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-400 text-black border-none font-bold animate-pulse text-[10px]">COMING SOON</Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Zippy Mobile App</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Experience the future of shopping. Our high-performance mobile protocol is landing soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Apple className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-bold text-white/40 leading-none mb-1">Coming to</p>
                    <p className="text-sm font-bold leading-none text-white">App Store</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 opacity-50 grayscale cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase font-bold text-white/40 leading-none mb-1">Coming to</p>
                    <p className="text-sm font-bold leading-none text-white">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <p className="text-gray-500 text-xs font-medium">
              © 2025 ZippyCart. All rights reserved.
            </p>
            <div className="h-4 w-px bg-gray-800 hidden md:block"></div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-500 hover:text-white text-xs transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-white text-xs transition-colors">
                Terms
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-bold">zippycart0712@gmail.com</span>
            </div>
            <div className="h-4 w-px bg-gray-800 hidden md:block"></div>
            <div className="flex items-center gap-2 text-gray-500">
              <Phone className="w-4 h-4" />
              <span className="text-xs font-bold">+91 7305122455</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;