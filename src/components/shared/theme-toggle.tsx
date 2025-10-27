import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle
 * Small icon button to toggle between light and dark themes.
 * Respects existing useTheme hook and persists preference.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className={className}
        >
            {isDark ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </Button>
    );
}
