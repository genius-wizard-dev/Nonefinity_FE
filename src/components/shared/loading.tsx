import LogoImage from "@/assets/Nonefinity_Dark.png";
import { AnimatePresence, motion } from "framer-motion";

interface LoadingProps {
  isOpen?: boolean;
  text?: string;
}

export function Loading({ isOpen = true, text }: LoadingProps) {
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
                  src={LogoImage}
                  alt="Loading"
                  className="h-16 w-16 opacity-70"
                />
              </motion.div>

              {/* Main logo */}
              <motion.img
                src={LogoImage}
                alt="Loading"
                className="h-16 w-16"
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
