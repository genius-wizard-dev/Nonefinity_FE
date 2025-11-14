import { useEffect, useState } from "react";

const THEME_EVENT = "nonefinity-theme-change" as const;

export function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        // Determine initial theme (saved -> system -> light)
        const savedTheme = localStorage.getItem("theme") as
            | "light"
            | "dark"
            | null;
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

        setTheme(initialTheme);
        document.documentElement.classList.toggle(
            "dark",
            initialTheme === "dark"
        );
        updateFavicon(initialTheme);

        // Listen for system theme changes (only when there's no manual override)
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem("theme")) {
                const newTheme = e.matches ? "dark" : "light";
                setTheme(newTheme);
                document.documentElement.classList.toggle(
                    "dark",
                    newTheme === "dark"
                );
                updateFavicon(newTheme);
                // Broadcast so other hook instances update too
                window.dispatchEvent(
                    new CustomEvent(THEME_EVENT, {
                        detail: { theme: newTheme },
                    })
                );
            }
        };
        mediaQuery.addEventListener("change", handleSystemChange);

        // React to theme changes from other components (same tab)
        const handleThemeEvent = (e: Event) => {
            // Prefer detail if provided, else infer from DOM
            const detailTheme = (e as CustomEvent<{ theme?: "light" | "dark" }>)
                .detail?.theme;
            const current =
                detailTheme ??
                (document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light");
            setTheme(current);
            updateFavicon(current);
        };
        window.addEventListener(THEME_EVENT, handleThemeEvent);

        // React to storage changes (other tabs). Note: 'storage' doesn't fire in same tab.
        const handleStorage = (se: StorageEvent) => {
            if (se.key === "theme") {
                const newTheme =
                    (se.newValue as "light" | "dark" | null) ?? initialTheme;
                setTheme(newTheme);
                document.documentElement.classList.toggle(
                    "dark",
                    newTheme === "dark"
                );
                updateFavicon(newTheme);
            }
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            mediaQuery.removeEventListener("change", handleSystemChange);
            window.removeEventListener(THEME_EVENT, handleThemeEvent);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const updateFavicon = (currentTheme: "light" | "dark") => {
        const favicon = document.querySelector(
            'link[rel="icon"]'
        ) as HTMLLinkElement;
        if (favicon) {
            // Use light logo for dark theme and dark logo for light theme
            const logoPath =
                currentTheme === "dark"
                    ? "/Nonefinity_Light.png"
                    : "/Nonefinity_Dark.png";
            favicon.href = logoPath;
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
        updateFavicon(newTheme);
        // Notify all listeners in this tab
        window.dispatchEvent(
            new CustomEvent(THEME_EVENT, { detail: { theme: newTheme } })
        );
    };

    return { theme, toggleTheme };
}
