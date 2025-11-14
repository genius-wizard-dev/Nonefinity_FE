import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";
import { motion } from "framer-motion";
import {
  Cloud,
  FileText,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const capabilities = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Multi-Format Support",
    description: "CSV, PDF, Excel, Word, TXT, and more",
    color: "text-blue-600",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Vector Search",
    description: "Semantic search across all your documents",
    color: "text-purple-600",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: "Cloud Storage",
    description: "Secure, scalable cloud infrastructure",
    color: "text-green-600",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance",
    color: "text-red-600",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-Time Processing",
    description: "Instant responses and updates",
    color: "text-yellow-600",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Quick Deployment",
    description: "Deploy in minutes, not months",
    color: "text-indigo-600",
  },
];

export function Features() {
  return (
    <section className="bg-gradient-to-br pt-20 from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/20 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <Particles
          className="absolute inset-0"
          quantity={40}
          color="#3b82f6"
          size={0.4}
          ease={70}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                <Sparkles className="h-3 w-3 mr-1" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Everything You Need to Build
                <div className="mt-2">
                  <SparklesText>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Intelligent AI
                    </span>
                  </SparklesText>
                </div>
              </h2>
            </motion.div>
          </div>
        </BlurFade>

        {/* Capabilities Section */}

        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Capabilities
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for enterprise needs with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability) => (
              <div key={capability.title}>
                <motion.div
                  className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 mb-4 group-hover:scale-110 transition-transform duration-300 ${capability.color}`}
                  >
                    {capability.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {capability.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {capability.description}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
