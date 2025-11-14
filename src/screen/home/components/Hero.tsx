import { AuroraText } from "@/components/ui/aurora-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { Globe } from "@/components/ui/globe";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Meteors } from "@/components/ui/meteors";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";
import { motion } from "framer-motion";
import { Brain, Database, MessageSquare, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
export function Hero() {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/20 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <Meteors number={20} />
        <Particles
          className="absolute inset-0"
          quantity={50}
          color="#3b82f6"
          size={0.5}
          ease={80}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Main Heading */}
              <BlurFade delay={0.2} inView>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Build Intelligent
                  <div className="mt-2">
                    <SparklesText>
                      <AuroraText>AI Agents</AuroraText>
                    </SparklesText>
                  </div>
                  <span className="block text-gray-900 dark:text-white mt-2">In Minutes</span>
                </h1>
              </BlurFade>

              {/* Subtitle */}
              <BlurFade delay={0.3} inView>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Transform your data into intelligent AI agents with our
                  no-code platform. Upload files, create embeddings, and deploy
                  powerful conversational AI instantly.
                </p>
              </BlurFade>

              {/* CTA Button */}
              <BlurFade delay={0.4} inView>
                <div className="flex items-center justify-center lg:justify-start mb-12">
                  <Link to="/sign-in">
                    <InteractiveHoverButton className="text-base px-6 py-3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-600">
                      Start Building Free
                    </InteractiveHoverButton>
                  </Link>
                </div>
              </BlurFade>

              {/* Stats */}
              <BlurFade delay={0.5} inView>
                <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      5 min
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Setup Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      99.9%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      24/7
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                  </div>
                </div>
              </BlurFade>
            </div>

            {/* Right Visual - Enhanced with Globe */}
            <div className="relative">
              <BlurFade delay={0.6} inView>
                <div className="relative mx-auto max-w-lg">
                  {/* Globe Component */}
                  <div className="relative h-96 w-96 mx-auto">
                    <Globe
                      className="w-full h-full"
                      config={{
                        width: 400,
                        height: 400,
                        onRender: () => {},
                        devicePixelRatio: 2,
                        phi: 0,
                        theta: 0.3,
                        dark: 0,
                        diffuse: 0.4,
                        mapSamples: 16000,
                        mapBrightness: 1.2,
                        baseColor: [0.8, 0.8, 1],
                        markerColor: [1, 0.5, 0.2],
                        glowColor: [1, 1, 1],
                        markers: [
                          { location: [14.5995, 120.9842], size: 0.03 },
                          { location: [19.076, 72.8777], size: 0.1 },
                          { location: [23.8103, 90.4125], size: 0.05 },
                          { location: [30.0444, 31.2357], size: 0.07 },
                          { location: [39.9042, 116.4074], size: 0.08 },
                          { location: [-23.5505, -46.6333], size: 0.1 },
                          { location: [19.4326, -99.1332], size: 0.1 },
                          { location: [40.7128, -74.006], size: 0.1 },
                          { location: [34.6937, 135.5022], size: 0.05 },
                          { location: [41.0082, 28.9784], size: 0.06 },
                        ],
                      }}
                    />

                    {/* Floating AI Elements */}
                    <motion.div
                      className="absolute top-8 right-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 dark:border-gray-700/20"
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          AI Ready
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="absolute bottom-8 left-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 dark:border-gray-700/20"
                      animate={{
                        y: [0, 8, 0],
                        rotate: [0, -1, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          Data Processing
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="absolute top-1/2 -left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 dark:border-gray-700/20"
                      animate={{
                        x: [0, -5, 0],
                        rotate: [0, -0.5, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          Chat Ready
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="absolute top-1/2 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 dark:border-gray-700/20"
                      animate={{
                        x: [0, 5, 0],
                        rotate: [0, 0.5, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          Analytics
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
