import LogoDark from "@/assets/Nonefinity_Dark.png";
import LogoLight from "@/assets/Nonefinity_Light.png";
import { useTheme } from "@/hooks/useTheme";
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
    const { theme } = useTheme();
    // Auto detect theme based on className or use system preference
    const getLogoSrc = () => {
        if (variant === "dark") return LogoDark;
        if (variant === "light") return LogoLight;
        // Use current theme to choose the correct contrasting logo
        return theme === "dark" ? LogoLight : LogoDark;
    };

    return (
        <motion.img
            src={getLogoSrc()}
            alt="Loading"
            className={cn(sizeMap[size], "drop-shadow-sm", className)}
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
