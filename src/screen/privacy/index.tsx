import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";
import { motion } from "framer-motion";
import { FileText, Lock, Mail, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer, Header } from "../home/components";

const sections = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create an account, we collect your name, email address, and authentication credentials.",
      },
      {
        subtitle: "Usage Data",
        text: "We collect information about how you interact with our services, including API calls, feature usage, and performance metrics.",
      },
      {
        subtitle: "Content Data",
        text: "Files and documents you upload are processed and stored securely to provide our AI services.",
      },
      {
        subtitle: "Technical Information",
        text: "IP address, browser type, device information, and operating system for security and optimization purposes.",
      },
    ],
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "Service Delivery",
        text: "To provide, maintain, and improve our AI agent platform and related services.",
      },
      {
        subtitle: "Communication",
        text: "To send you service updates, security alerts, and respond to your inquiries.",
      },
      {
        subtitle: "Analytics",
        text: "To understand usage patterns and improve our platform's performance and features.",
      },
      {
        subtitle: "Security",
        text: "To detect, prevent, and address technical issues, fraud, and security incidents.",
      },
    ],
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Data Security",
    content: [
      {
        subtitle: "Encryption",
        text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
      },
      {
        subtitle: "Access Controls",
        text: "Strict role-based access control (RBAC) ensures only authorized personnel can access your data.",
      },
      {
        subtitle: "Infrastructure Security",
        text: "Our infrastructure is hosted on SOC 2 Type II certified cloud providers with regular security audits.",
      },
      {
        subtitle: "Data Isolation",
        text: "Each customer's data is logically isolated and cannot be accessed by other users.",
      },
    ],
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Data Sharing and Disclosure",
    content: [
      {
        subtitle: "Third-Party Services",
        text: "We may share data with trusted third-party service providers who assist in operating our platform (e.g., cloud hosting, analytics).",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose information when required by law or to protect our rights and the safety of our users.",
      },
      {
        subtitle: "Business Transfers",
        text: "In the event of a merger, acquisition, or sale, user data may be transferred as part of that transaction.",
      },
      {
        subtitle: "AI Model Providers",
        text: "Your prompts and content may be sent to AI model providers (OpenAI, Anthropic, Google) as necessary to deliver our services. We do not use your data to train AI models.",
      },
    ],
  },
];

const dataRights = [
  {
    title: "Access",
    description: "Request a copy of the personal data we hold about you",
  },
  {
    title: "Correction",
    description: "Update or correct inaccurate personal information",
  },
  {
    title: "Deletion",
    description:
      "Request deletion of your personal data (subject to legal obligations)",
  },
  {
    title: "Portability",
    description: "Receive your data in a structured, machine-readable format",
  },
  {
    title: "Objection",
    description: "Object to certain processing of your personal data",
  },
  {
    title: "Withdrawal",
    description: "Withdraw consent for data processing at any time",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 h-full max-h-[600px]">
            <Particles
              className="absolute inset-0 h-full"
              quantity={30}
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
                    <Shield className="h-3 w-3 mr-1" />
                    Last Updated: December 3, 2025
                  </Badge>

                  <h1 className="text-5xl sm:text-6xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Privacy Policy
                    </span>
                  </h1>

                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Your privacy is important to us. This policy explains how
                    Nonefinity collects, uses, and protects your personal
                    information.
                  </p>
                </motion.div>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            {/* Introduction */}
            <BlurFade delay={0.1} inView>
              <div className="mb-16 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Introduction
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Nonefinity ("we," "our," or "us") is committed to protecting
                  your privacy. This Privacy Policy describes how we collect,
                  use, disclose, and safeguard your information when you use our
                  AI agent platform and services. By using Nonefinity, you agree
                  to the collection and use of information in accordance with
                  this policy.
                </p>
              </div>
            </BlurFade>

            {/* Policy Sections */}
            <div className="space-y-12">
              {sections.map((section, index) => (
                <BlurFade key={section.title} delay={0.1 + index * 0.1} inView>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {item.subtitle}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </BlurFade>
              ))}
            </div>

            {/* Data Rights */}
            <BlurFade delay={0.3} inView>
              <div className="mt-16 p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Your Rights
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Under GDPR, CCPA, and other privacy regulations, you have the
                  following rights regarding your personal data:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {dataRights.map((right, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {right.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {right.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    To exercise any of these rights, please contact us at{" "}
                    <a
                      href="mailto:privacy@nonefinity.com"
                      className="font-semibold underline hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      privacy@nonefinity.com
                    </a>
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Cookies and Tracking */}
            <BlurFade delay={0.4} inView>
              <div className="mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use cookies and similar tracking technologies to track
                  activity on our service and store certain information. You can
                  instruct your browser to refuse all cookies or to indicate
                  when a cookie is being sent.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Types of cookies we use: essential cookies (required for
                  service functionality), analytics cookies (to understand usage
                  patterns), and preference cookies (to remember your settings).
                </p>
              </div>
            </BlurFade>

            {/* Data Retention */}
            <BlurFade delay={0.5} inView>
              <div className="mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Data Retention
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We retain your personal information only for as long as
                  necessary to fulfill the purposes outlined in this Privacy
                  Policy, unless a longer retention period is required by law.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Account data: Retained while your account is active</li>
                  <li>
                    Usage data: Retained for up to 2 years for analytics
                    purposes
                  </li>
                  <li>
                    Uploaded content: Retained until you delete it or close your
                    account
                  </li>
                  <li>
                    Backup data: Retained for 90 days after deletion for
                    recovery purposes
                  </li>
                </ul>
              </div>
            </BlurFade>

            {/* Contact Section */}
            <BlurFade delay={0.6} inView>
              <div className="mt-16 p-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl text-white text-center">
                <Mail className="h-12 w-12 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">
                  Questions About Privacy?
                </h2>
                <p className="mb-6 text-blue-100">
                  If you have any questions about this Privacy Policy or our
                  data practices, please don't hesitate to contact us.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <a href="mailto:privacy@nonefinity.com">Email Us</a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-cyan-400/50 text-white bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 dark:from-cyan-500/30 dark:to-emerald-500/30 backdrop-blur-sm transition-all hover:from-cyan-500 hover:to-emerald-500 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50"
                  >
                    <Link
                      to="/contact"
                      className="text-white transition-colors"
                    >
                      Contact Support
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
