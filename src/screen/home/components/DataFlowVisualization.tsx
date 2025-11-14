import { useTheme } from "@/hooks/useTheme";
import {
    ChatBotIcon,
    CsvIcon,
    DataAnalysisIcon,
    DocsIcon,
    ExcelIcon,
    PdfIcon,
    TxtIcon,
} from "@/components/icons";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { SparklesText } from "@/components/ui/sparkles-text";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import React, { forwardRef, useRef } from "react";

// Circle component for animated beam
// Circle component for animated beam with smaller width and height
const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-20 flex size-16 items-center justify-center rounded-full border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:shadow-[0_0_20px_-12px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-110",
                className
            )}
        >
            {children}
        </div>
    );
});

Circle.displayName = "Circle";

// Icons for different file types and services using custom SVG icons

export function DataFlowVisualization() {
    // Main demo refs
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const csvRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);
    const txtRef = useRef<HTMLDivElement>(null);
    const xlsxRef = useRef<HTMLDivElement>(null);
    const docxRef = useRef<HTMLDivElement>(null);
    const storageRef = useRef<HTMLDivElement>(null);
    const chatbotRef = useRef<HTMLDivElement>(null);
    const analyticsRef = useRef<HTMLDivElement>(null);

    // Theme-based assets
    const { theme } = useTheme();
    const logoSrc =
        theme === "dark" ? "/Nonefinity_Light.png" : "/Nonefinity_Dark.png";

    // Icons for different file types and services using custom SVG icons
    const Icons = {
        csv: () => <CsvIcon />,
        pdf: () => <PdfIcon />,
        txt: () => <TxtIcon />,
        xlsx: () => <ExcelIcon />,
        docx: () => <DocsIcon />,
        storage: () => (
            <img
                src={logoSrc}
                alt="Storage"
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block",
                    margin: "0 auto",
                }}
            />
        ),
        chatbot: () => <ChatBotIcon />,
        analytics: () => <DataAnalysisIcon />,
    } as const;

    return (
        <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                                Simple Process
                            </Badge>
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                How It Works
                                <div className="mt-2">
                                    <SparklesText>
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                            Data to AI
                                        </span>
                                    </SparklesText>
                                </div>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                From raw data to intelligent chatbot in just a
                                few simple steps. Watch how your files transform
                                into powerful AI agents.
                            </p>
                        </motion.div>
                    </div>
                </BlurFade>

                {/* Main Demo Section */}
                <motion.div
                    className="relative flex h-[700px] w-full items-center justify-center overflow-hidden p-12 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-950/30 dark:to-purple-950/30 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-20"
                    ref={mainContainerRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ zIndex: 1 }}
                >
                    {/* Dot Pattern Background */}
                    <DotPattern
                        className={cn(
                            "absolute inset-0 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)] opacity-30"
                        )}
                    />
                    {/* File Types Row - Better aligned */}
                    <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 z-10">
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={csvRef}
                                className="bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.csv />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Spreadsheet
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={pdfRef}
                                className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.pdf />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    Document
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={txtRef}
                                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.txt />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                    Text File
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={xlsxRef}
                                className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.xlsx />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    Excel
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={docxRef}
                                className="bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.docx />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    Word Doc
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center -mt-8">
                        <Circle
                            ref={storageRef}
                            className="size-28 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-400 dark:border-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300"
                        >
                            <Icons.storage />
                        </Circle>
                        <div className="mt-4 text-center">
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                Nonefinity Storage
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                Secure Cloud Processing
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                AI-Powered Data Processing
                            </p>
                        </div>
                    </div>

                    {/* Output Services Row - Better aligned */}
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 z-10">
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={chatbotRef}
                                className="bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.chatbot />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    Smart Assistant
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Circle
                                ref={analyticsRef}
                                className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800 hover:shadow-lg transition-all duration-300"
                            >
                                <Icons.analytics />
                            </Circle>
                            <div className="mt-2 text-center">
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                    Data Insights
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Animated Beams - Input to Storage */}
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={csvRef}
                        toRef={storageRef}
                        curvature={-15}
                        duration={2.5}
                        className="opacity-90"
                    />
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={pdfRef}
                        toRef={storageRef}
                        curvature={-5}
                        duration={2.5}
                        delay={0.3}
                        className="opacity-90"
                    />
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={txtRef}
                        toRef={storageRef}
                        curvature={5}
                        duration={2.5}
                        delay={0.6}
                        className="opacity-90"
                    />
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={xlsxRef}
                        toRef={storageRef}
                        curvature={15}
                        duration={2.5}
                        delay={0.9}
                        className="opacity-90"
                    />
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={docxRef}
                        toRef={storageRef}
                        curvature={25}
                        duration={2.5}
                        delay={1.2}
                        className="opacity-90"
                    />

                    {/* Animated Beams - Storage to Services */}
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={storageRef}
                        toRef={analyticsRef}
                        curvature={-10}
                        duration={2.5}
                        delay={1.5}
                        className="opacity-90"
                    />
                    <AnimatedBeam
                        containerRef={mainContainerRef}
                        fromRef={storageRef}
                        toRef={chatbotRef}
                        curvature={10}
                        duration={2.5}
                        delay={1.8}
                        className="opacity-90"
                    />
                </motion.div>
            </div>
        </section>
    );
}
