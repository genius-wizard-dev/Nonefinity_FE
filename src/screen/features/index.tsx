import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Brain,
  Cloud,
  Code,
  Database,
  FileText,
  Globe,
  Lock,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../home/components";

const featuresData = [
  {
    category: "AI Capabilities",
    icon: <Brain className="h-6 w-6" />,
    color: "from-blue-600 to-cyan-600",
    items: [
      {
        icon: <Bot className="h-5 w-5" />,
        title: "Advanced AI Agents",
        description:
          "Deploy intelligent AI agents powered by LangGraph for complex workflows and decision-making",
      },
      {
        icon: <MessageSquare className="h-5 w-5" />,
        title: "Natural Conversations",
        description:
          "Engage in human-like conversations with context-aware AI assistants",
      },
      {
        icon: <Search className="h-5 w-5" />,
        title: "Semantic Search",
        description:
          "Find information instantly with vector-based semantic search across all documents",
      },
      {
        icon: <Brain className="h-5 w-5" />,
        title: "Multi-Model Support",
        description:
          "Choose from GPT-4, Claude, Gemini, and more for optimal performance",
      },
    ],
  },
  {
    category: "Data Management",
    icon: <Database className="h-6 w-6" />,
    color: "from-purple-600 to-pink-600",
    items: [
      {
        icon: <FileText className="h-5 w-5" />,
        title: "Multi-Format Processing",
        description:
          "Support for CSV, PDF, Excel, Word, TXT, JSON, and 20+ file formats",
      },
      {
        icon: <Database className="h-5 w-5" />,
        title: "Knowledge Stores",
        description:
          "Organize and manage your data with powerful knowledge base systems",
      },
      {
        icon: <Cloud className="h-5 w-5" />,
        title: "Cloud Storage",
        description:
          "Scalable cloud infrastructure with automatic backups and versioning",
      },
      {
        icon: <Zap className="h-5 w-5" />,
        title: "Real-Time Sync",
        description:
          "Instant synchronization across all devices and team members",
      },
    ],
  },
  {
    category: "Developer Tools",
    icon: <Code className="h-6 w-6" />,
    color: "from-green-600 to-emerald-600",
    items: [
      {
        icon: <Code className="h-5 w-5" />,
        title: "RESTful API",
        description:
          "Comprehensive API for seamless integration with your applications",
      },
      {
        icon: <Settings className="h-5 w-5" />,
        title: "Custom Workflows",
        description:
          "Build and deploy custom AI workflows with visual flow builder",
      },
      {
        icon: <Rocket className="h-5 w-5" />,
        title: "Quick Deployment",
        description:
          "Deploy AI agents in minutes with one-click deployment system",
      },
      {
        icon: <Globe className="h-5 w-5" />,
        title: "Webhooks & Integrations",
        description:
          "Connect with Slack, Discord, Telegram, and 100+ platforms",
      },
    ],
  },
  {
    category: "Security & Compliance",
    icon: <Shield className="h-6 w-6" />,
    color: "from-red-600 to-orange-600",
    items: [
      {
        icon: <Lock className="h-5 w-5" />,
        title: "Enterprise Security",
        description:
          "Bank-level encryption with SOC 2 Type II and ISO 27001 compliance",
      },
      {
        icon: <Shield className="h-5 w-5" />,
        title: "Data Privacy",
        description:
          "GDPR and CCPA compliant with complete data sovereignty options",
      },
      {
        icon: <Settings className="h-5 w-5" />,
        title: "Access Control",
        description:
          "Fine-grained permissions and role-based access control (RBAC)",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        title: "Audit Logs",
        description:
          "Complete audit trails with detailed logging for compliance",
      },
    ],
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 100ms", label: "Response Time" },
  { value: "20+", label: "File Formats" },
  { value: "24/7", label: "Support" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 h-full max-h-[600px]">
            <Particles
              className="absolute inset-0 h-full"
              quantity={50}
              color="#3b82f6"
              size={0.4}
              ease={70}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <BlurFade delay={0.1} inView>
              <div className="text-center max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Complete Feature Set
                  </Badge>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    <SparklesText>
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Powerful Features
                      </span>
                    </SparklesText>
                    <br />
                    <span className="text-gray-900 dark:text-white">
                      for Modern AI
                    </span>
                  </h1>

                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                    Everything you need to build, deploy, and scale intelligent
                    AI applications. From advanced agents to enterprise
                    security.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      size="lg"
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Link to="/sign-up">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/contact">Schedule Demo</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </BlurFade>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-20"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20"
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Categories */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {featuresData.map((category, categoryIndex) => (
                <BlurFade
                  key={category.category}
                  delay={0.1 + categoryIndex * 0.1}
                  inView
                >
                  <div>
                    {/* Category Header */}
                    <div className="text-center mb-12">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${category.color} text-white mb-4`}
                      >
                        {category.icon}
                        <span className="font-semibold">
                          {category.category}
                        </span>
                      </div>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {category.items.map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
                        >
                          <div
                            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                          >
                            {feature.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {feature.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 h-full max-h-[500px]">
            <Particles
              className="absolute inset-0 h-full"
              quantity={30}
              color="#ffffff"
              size={0.3}
              ease={80}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <BlurFade delay={0.2} inView>
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Join thousands of developers building intelligent AI
                  applications with Nonefinity
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Link to="/sign-up">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/contact" className="text-white">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
