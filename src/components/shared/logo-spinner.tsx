import LogoDark from "@/assets/Nonefinity_Dark.png";
import LogoLight from "@/assets/Nonefinity_Light.png";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "auto" | "dark" | "light";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-16 w-16",
};

export function LogoSpinner({
  className,
  size = "md",
  variant = "auto",
}: LogoSpinnerProps) {
  // Auto detect theme based on className or use system preference
  const getLogoSrc = () => {
    if (variant === "dark") return LogoDark;
    if (variant === "light") return LogoLight;

    // Auto detection logic
    if (className) {
      // Check for dark background indicators in className
      const darkIndicators = [
        "bg-primary",
        "bg-destructive",
        "bg-secondary",
        "bg-accent",
        "bg-blue",
        "bg-red",
        "bg-green",
        "bg-yellow",
        "bg-purple",
        "bg-pink",
        "bg-indigo",
        "bg-gray-",
        "bg-slate-",
        "bg-zinc-",
        "bg-neutral-",
        "text-white",
        "text-primary-foreground",
        "text-destructive-foreground",
      ];

      const hasColoredBackground = darkIndicators.some((indicator) =>
        className.includes(indicator)
      );

      if (hasColoredBackground) return LogoLight;
    }

    // Default to dark logo for light backgrounds
    return LogoDark;
  };

  return (
    <motion.img
      src={getLogoSrc()}
      alt="Loading"
      className={cn(sizeMap[size], className)}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
