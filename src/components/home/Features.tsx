import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Database, MessageSquare, Settings, Upload, Zap } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload & Process Files",
    description:
      "Upload documents, images, and data files. Our platform automatically processes and indexes your content for AI training.",
    color: "text-blue-600",
  },
  {
    icon: Database,
    title: "Run SQL Queries",
    description:
      "Execute complex SQL queries on your data. Transform and analyze information with powerful database operations.",
    color: "text-green-600",
  },
  {
    icon: Zap,
    title: "Create Embeddings",
    description:
      "Generate vector embeddings from your content. Enable semantic search and contextual understanding for your chatbot.",
    color: "text-purple-600",
  },
  {
    icon: Settings,
    title: "Configure AI Models",
    description:
      "Fine-tune AI models to match your needs. Choose from various architectures and customize parameters for optimal performance.",
    color: "text-orange-600",
  },
  {
    icon: MessageSquare,
    title: "Smart Prompt Engineering",
    description:
      "Design intelligent prompts and conversation flows. Create engaging and contextually aware chatbot interactions.",
    color: "text-pink-600",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Build AI Chatbots
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From data processing to deployment, our platform provides all the
            tools you need to create intelligent conversational AI.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Chatbots Created</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50M+</div>
            <div className="text-gray-600">Messages Processed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime Guarantee</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
