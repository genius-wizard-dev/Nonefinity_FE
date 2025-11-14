import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  Book,
  Github,
  HelpCircle,
  Linkedin,
  Mail,
  Twitter,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Documentation",
        href: "https://docs.nonefinity.com/",
        icon: Book,
      },
      { label: "API Reference", href: "/api" },
      { label: "Tutorials", href: "/tutorials" },
      { label: "Examples", href: "/examples" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help", icon: HelpCircle },
      { label: "Contact Us", href: "/contact", icon: Mail },
      { label: "Community", href: "/community", icon: Users },
      { label: "Status Page", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/nonefinity", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/nonefinity", label: "Twitter" },
  {
    icon: Linkedin,
    href: "https://linkedin.com/company/nonefinity",
    label: "LinkedIn",
  },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <BlurFade delay={0.1} inView>
              <Link to="/" className="flex items-center space-x-2 mb-4 group">
                <img
                  src="/Nonefinity_Light.png"
                  alt="Logo"
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold">Nonefinity</span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                Build intelligent AI agents in minutes. Upload files, run SQL
                queries, create embeddings, and deploy powerful conversational
                AI with enterprise-grade performance.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                  >
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                ))}
              </div>
            </BlurFade>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, sectionIndex) => (
            <BlurFade
              key={section.title}
              delay={0.2 + sectionIndex * 0.1}
              inView
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors flex items-center space-x-2 group"
                      >
                        {link.icon && (
                          <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        )}
                        <span className="hover:translate-x-1 transition-transform duration-200">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Newsletter Signup */}
        <BlurFade delay={0.6} inView>
          <ShineBorder
            className="border-gray-700 bg-gray-800/30 backdrop-blur-sm p-6 mb-8"
            color="#3b82f6"
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Stay Updated
                </h3>
                <p className="text-gray-400">
                  Get the latest updates on new features and AI developments.
                </p>
              </div>
              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-l-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 transition-colors"
                />
                <Button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-r-lg rounded-l-none font-medium">
                  Subscribe
                </Button>
              </div>
            </div>
          </ShineBorder>
        </BlurFade>

        {/* Bottom Bar */}
        <BlurFade delay={0.7} inView>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              © {new Date().getFullYear()} Nonefinity. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="hover:text-blue-400 transition-colors hover:translate-y-[-1px] duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-blue-400 transition-colors hover:translate-y-[-1px] duration-200"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="hover:text-blue-400 transition-colors hover:translate-y-[-1px] duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </BlurFade>
      </div>
    </footer>
  );
}
