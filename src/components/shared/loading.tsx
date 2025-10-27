import LogoDark from "@/assets/Nonefinity_Dark.png";
import LogoLight from "@/assets/Nonefinity_Light.png";
import { useTheme } from "@/hooks/useTheme";
import { AnimatePresence, motion } from "framer-motion";

interface LoadingProps {
    isOpen?: boolean;
    text?: string;
}

export function Loading({ isOpen = true, text }: LoadingProps) {
    const { theme } = useTheme();
    const logoImage = theme === "dark" ? LogoLight : LogoDark;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
                    {/* Loading content */}
                    <div className="relative flex flex-col items-center gap-4">
                        {/* Animated Logo */}
                        <div className="relative">
                            {/* Subtle ring spinner behind the logo for better contrast in dark mode */}
                            <div className="absolute inset-0 -m-4 flex items-center justify-center">
                                <div className="h-20 w-20 rounded-full border-2 border-primary/40 border-t-transparent animate-spin" />
                            </div>
                            {/* Glow effect */}
                            <motion.div
                                className="absolute inset-0 -z-10 blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <img
                                    src={logoImage}
                                    alt="Loading"
                                    className="h-16 w-16 opacity-70 drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]"
                                />
                            </motion.div>

                            {/* Main logo */}
                            <motion.img
                                src={logoImage}
                                alt="Loading"
                                className="h-16 w-16 drop-shadow-[0_0_8px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    rotate: {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    },
                                    scale: {
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                }}
                            />
                        </div>

                        {/* Optional loading text */}
                        {text && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-muted-foreground"
                            >
                                {text}
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
