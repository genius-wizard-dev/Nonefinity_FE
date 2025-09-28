import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">
              Build AI Chatbots in Minutes
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build Intelligent{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              AI Chatbots
            </span>{" "}
            Fast
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Upload files, run SQL queries, create embeddings, and configure AI
            models. Build powerful chatbots with our intuitive platform in just
            a few clicks.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button size="lg" className="text-lg px-8 py-4" asChild>
              <Link to="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4"
              asChild
            >
              <Link to="/playground">
                <Play className="mr-2 h-5 w-5" />
                Try Playground
              </Link>
            </Button>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Main Dashboard Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-4">
                  {/* Navigation Bar */}
                  <div className="flex space-x-6 border-b pb-4">
                    <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium">
                      Files
                    </div>
                    <div className="px-3 py-1 text-gray-600 text-sm">SQL</div>
                    <div className="px-3 py-1 text-gray-600 text-sm">
                      Embeddings
                    </div>
                    <div className="px-3 py-1 text-gray-600 text-sm">
                      AI Config
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Upload Area</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        Preview Panel
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-600">AI Ready</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-gray-600">Processing...</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
