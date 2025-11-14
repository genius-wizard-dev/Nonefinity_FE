import LogoDark from "@/assets/Nonefinity_Dark.png";
import LogoLight from "@/assets/Nonefinity_Light.png";
import { useTheme } from "@/hooks/useTheme";
import { AnimatePresence, motion } from "framer-motion";

interface LoadingProps {
  isOpen?: boolean;
}

export function Loading({ isOpen = true }: LoadingProps) {
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
          <motion.img
            src={logoImage}
            alt="Loading"
            className="h-16 w-16"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
