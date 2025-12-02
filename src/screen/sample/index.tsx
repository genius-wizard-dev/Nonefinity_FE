import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  GitBranch,
  Layers,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../home/components";

const codeExamples = [
  {
    title: "Quick Start",
    language: "python",
    code: `from nonefinity import Agent

# Initialize your AI agent
agent = Agent(
    name="Customer Support Bot",
    model="gpt-4",
    temperature=0.7
)

# Add knowledge base
agent.add_knowledge_store("support-docs")

# Deploy your agent
agent.deploy()`,
  },
  {
    title: "Custom Workflow",
    language: "python",
    code: `from nonefinity import Workflow, Tool

# Create custom tools
@Tool(name="search_database")
def search_db(query: str) -> dict:
    return db.search(query)

# Build workflow
workflow = Workflow()
workflow.add_step("search", search_db)
workflow.add_step("summarize", agent)
workflow.execute()`,
  },
  {
    title: "API Integration",
    language: "javascript",
    code: `import { NonefinitySdk } from '@nonefinity/sdk';

const client = new NonefinitySdk({
  apiKey: process.env.NONEFINITY_API_KEY
});

// Chat with your agent
const response = await client.chat.send({
  agentId: "agent_123",
  message: "Hello, how can I help?"
});

console.log(response.content);`,
  },
];

const useCases = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Customer Support Automation",
    description: "Deploy AI agents that handle customer inquiries 24/7",
    metrics: [
      "90% reduction in response time",
      "85% automation rate",
      "95% customer satisfaction",
    ],
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Document Intelligence",
    description: "Extract insights from thousands of documents instantly",
    metrics: [
      "10x faster analysis",
      "99% accuracy rate",
      "Support for 20+ formats",
    ],
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: "Code Assistant",
    description: "AI-powered coding assistant for your development team",
    metrics: [
      "50% faster debugging",
      "Supports 30+ languages",
      "Real-time suggestions",
    ],
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    title: "Workflow Automation",
    description: "Automate complex business processes with AI",
    metrics: ["70% time savings", "Zero-code setup", "100+ integrations"],
  },
];

const architectureSteps = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Data Ingestion",
    description:
      "Upload and process multi-format documents with automatic parsing",
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Vector Storage",
    description:
      "Convert data to embeddings and store in high-performance vector database",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "AI Processing",
    description:
      "Process queries with advanced LLMs and retrieval-augmented generation",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "API Response",
    description:
      "Return results via RESTful API or webhooks for seamless integration",
  },
];

export default function SamplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0">
            <Particles
              className="absolute inset-0"
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
                    <Code className="h-3 w-3 mr-1" />
                    Examples & Use Cases
                  </Badge>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                    <SparklesText>
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        See Nonefinity
                      </span>
                    </SparklesText>
                    <br />
                    <span className="text-gray-900 dark:text-white">
                      in Action
                    </span>
                  </h1>

                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                    Real-world examples, code snippets, and use cases to help
                    you get started with Nonefinity's AI platform.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      size="lg"
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Link to="/sign-up">
                        Try Live Demo
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/docs">View Docs</Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* Code Examples */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <BlurFade delay={0.2} inView>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Start Code Examples
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Get up and running in minutes with these simple examples
                </p>
              </div>
            </BlurFade>

            <div className="grid lg:grid-cols-3 gap-6">
              {codeExamples.map((example, index) => (
                <BlurFade key={example.title} delay={0.3 + index * 0.1} inView>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-blue-600" />
                          {example.title}
                        </CardTitle>
                        <CardDescription>{example.language}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{example.code}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </motion.div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <BlurFade delay={0.2} inView>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Real-World Use Cases
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  See how companies are using Nonefinity to transform their
                  business
                </p>
              </div>
            </BlurFade>

            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => (
                <BlurFade key={useCase.title} delay={0.3 + index * 0.1} inView>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
                      {useCase.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {useCase.description}
                    </p>
                    <div className="space-y-2">
                      {useCase.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {metric}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <BlurFade delay={0.2} inView>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Understand the architecture behind Nonefinity's AI platform
                </p>
              </div>
            </BlurFade>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {architectureSteps.map((step, index) => (
                  <BlurFade key={step.title} delay={0.3 + index * 0.1} inView>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  </BlurFade>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0">
            <Particles
              className="absolute inset-0"
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
                  Ready to Build Your AI Agent?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Start building intelligent applications with Nonefinity today.
                  No credit card required.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Link to="/sign-up">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white text-white hover:bg-white/10"
                  >
                    <Link to="/docs">
                      View Documentation
                    </Link>
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
