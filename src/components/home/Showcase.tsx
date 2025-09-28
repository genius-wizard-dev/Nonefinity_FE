import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Code, ExternalLink, Play } from "lucide-react";

const showcaseItems = [
  {
    title: "E-commerce Support Bot",
    description:
      "AI chatbot that handles customer inquiries, product recommendations, and order tracking with 95% accuracy.",
    image: "/api/placeholder/400/300",
    tags: ["E-commerce", "Customer Support", "Natural Language"],
    demoUrl: "/demo/ecommerce",
    codeUrl: "/examples/ecommerce",
  },
  {
    title: "Document Q&A Assistant",
    description:
      "Upload PDFs, docs, and get instant answers. Perfect for legal documents, manuals, and knowledge bases.",
    image: "/api/placeholder/400/300",
    tags: ["Document Processing", "Q&A", "Knowledge Base"],
    demoUrl: "/demo/document-qa",
    codeUrl: "/examples/document-qa",
  },
  {
    title: "SQL Query Builder",
    description:
      "Natural language to SQL converter. Ask questions about your database in plain English and get results instantly.",
    image: "/api/placeholder/400/300",
    tags: ["SQL", "Database", "Analytics"],
    demoUrl: "/demo/sql-builder",
    codeUrl: "/examples/sql-builder",
  },
];

export function Showcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
            See What You Can Build
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore real examples of chatbots built with our platform. From
            simple Q&A to complex business automation.
          </p>
        </motion.div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
              }}
            >
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 group">
                {/* Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Demo Preview</div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button size="sm" variant="default">
                      <Play className="mr-2 h-4 w-4" />
                      Try Demo
                    </Button>
                    <Button size="sm" variant="outline">
                      <Code className="mr-2 h-4 w-4" />
                      View Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Build Your Own?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and businesses who trust Nonefinity to
            power their AI chatbots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600">
              Start Building Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              View All Examples
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
