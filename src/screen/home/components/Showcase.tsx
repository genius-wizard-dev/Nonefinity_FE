import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Showcase() {
  return (
    <section className="pb-20 relative overflow-hidden">
      {/* Enhanced Background Effects */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CTA Section */}
        <BlurFade delay={0.6} inView>
          <motion.div
            className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start building your AI agent today. No credit card required.
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
