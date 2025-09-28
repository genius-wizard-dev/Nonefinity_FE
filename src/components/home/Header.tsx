import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bot, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">Nonefinity</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/features"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              to="/docs"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Documentation
            </Link>
            <Link
              to="/pricing"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <Link
                to="/features"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/docs"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" asChild>
                  <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
