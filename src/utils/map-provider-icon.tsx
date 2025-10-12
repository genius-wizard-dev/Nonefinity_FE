import type { SVGProps } from "react";
import React from "react";

// Import all SVG components
import { Groq } from "../components/ui/svgs/groq";
import { GroqWordmarkDark } from "../components/ui/svgs/groqWordmarkDark";
import { GroqWordmarkLight } from "../components/ui/svgs/groqWordmarkLight";
import { HuggingFace } from "../components/ui/svgs/huggingFace";
import { NvidiaIconDark } from "../components/ui/svgs/nvidiaIconDark";
import { NvidiaIconLight } from "../components/ui/svgs/nvidiaIconLight";
import { NvidiaWordmarkDark } from "../components/ui/svgs/nvidiaWordmarkDark";
import { NvidiaWordmarkLight } from "../components/ui/svgs/nvidiaWordmarkLight";
import { Openai } from "../components/ui/svgs/openai";
import { OpenaiDark } from "../components/ui/svgs/openaiDark";
import { OpenaiWordmarkDark } from "../components/ui/svgs/openaiWordmarkDark";
import { OpenaiWordmarkLight } from "../components/ui/svgs/openaiWordmarkLight";
import { OpenrouterDark } from "../components/ui/svgs/openrouterDark";
import { OpenrouterLight } from "../components/ui/svgs/openrouterLight";
import { TogetheraiDark } from "../components/ui/svgs/togetheraiDark";
import { TogetheraiLight } from "../components/ui/svgs/togetheraiLight";

// Define provider types
import type { ProviderName } from "../screen/dashboard/credentials/type";

export type IconVariant = "icon" | "wordmark";
export type ThemeVariant = "light" | "dark";

// Define the mapping object
const providerIconMap: Record<
  ProviderName,
  Record<
    IconVariant,
    Record<ThemeVariant, React.ComponentType<SVGProps<SVGSVGElement>>>
  >
> = {
  groq: {
    icon: {
      light: Groq,
      dark: Groq,
    },
    wordmark: {
      light: GroqWordmarkLight,
      dark: GroqWordmarkDark,
    },
  },
  openai: {
    icon: {
      light: Openai,
      dark: OpenaiDark,
    },
    wordmark: {
      light: OpenaiWordmarkLight,
      dark: OpenaiWordmarkDark,
    },
  },
  huggingface: {
    icon: {
      light: HuggingFace,
      dark: HuggingFace,
    },
    wordmark: {
      light: HuggingFace,
      dark: HuggingFace,
    },
  },
  nvidia: {
    icon: {
      light: NvidiaIconLight,
      dark: NvidiaIconDark,
    },
    wordmark: {
      light: NvidiaWordmarkLight,
      dark: NvidiaWordmarkDark,
    },
  },
  togetherai: {
    icon: {
      light: TogetheraiLight,
      dark: TogetheraiDark,
    },
    wordmark: {
      light: TogetheraiLight,
      dark: TogetheraiDark,
    },
  },
  openrouter: {
    icon: {
      light: OpenrouterLight,
      dark: OpenrouterDark,
    },
    wordmark: {
      light: OpenrouterLight,
      dark: OpenrouterDark,
    },
  },
};

/**
 * Maps a provider name to its corresponding icon component
 * @param provider - The name of the provider
 * @param variant - The icon variant (icon or wordmark)
 * @param theme - The theme variant (light or dark)
 * @param size - Custom size for the icon (width and height)
 * @returns The corresponding SVG component or null if not found
 */
export function mapProviderIcon(
  provider: ProviderName,
  variant: IconVariant = "icon",
  theme: ThemeVariant = "light",
  size?: { width?: number; height?: number }
): React.ComponentType<SVGProps<SVGSVGElement>> | null {
  try {
    const IconComponent = providerIconMap[provider]?.[variant]?.[theme];
    if (!IconComponent) return null;

    // Return a wrapper component with custom size if provided
    if (size) {
      return (props: SVGProps<SVGSVGElement>) => (
        <IconComponent
          {...props}
          width={size.width || props.width}
          height={size.height || props.height}
        />
      );
    }

    return IconComponent;
  } catch {
    console.warn(
      `Provider icon not found for: ${provider} (${variant}, ${theme})`
    );
    return null;
  }
}

/**
 * Gets all available provider names
 * @returns Array of available provider names
 */
export function getAvailableProviders(): ProviderName[] {
  return Object.keys(providerIconMap) as ProviderName[];
}

/**
 * Gets all available variants for a specific provider
 * @param provider - The provider name
 * @returns Object with available variants and themes
 */
export function getProviderVariants(provider: ProviderName): {
  variants: IconVariant[];
  themes: ThemeVariant[];
} {
  const providerData = providerIconMap[provider];
  if (!providerData) {
    return { variants: [], themes: [] };
  }

  return {
    variants: Object.keys(providerData) as IconVariant[],
    themes: Object.keys(providerData.icon) as ThemeVariant[],
  };
}

/**
 * Predefined size configurations for different providers
 * Some providers have icons that are naturally smaller and need larger display size
 */
export const PROVIDER_ICON_SIZES: Record<
  ProviderName,
  { width: number; height: number }
> = {
  groq: { width: 20, height: 20 },
  openai: { width: 22, height: 22 },
  huggingface: { width: 24, height: 24 },
  nvidia: { width: 20, height: 20 },
  togetherai: { width: 22, height: 22 },
  openrouter: { width: 20, height: 20 },
};

/**
 * Maps a provider name to its corresponding icon component with optimized size
 * @param provider - The name of the provider
 * @param variant - The icon variant (icon or wordmark)
 * @param theme - The theme variant (light or dark)
 * @param useOptimizedSize - Whether to use the predefined optimized size for the provider
 * @returns The corresponding SVG component with optimized size or null if not found
 */
export function mapProviderIconWithSize(
  provider: ProviderName,
  variant: IconVariant = "icon",
  theme: ThemeVariant = "light",
  useOptimizedSize: boolean = true
): React.ComponentType<SVGProps<SVGSVGElement>> | null {
  const optimizedSize = useOptimizedSize
    ? PROVIDER_ICON_SIZES[provider]
    : undefined;
  return mapProviderIcon(provider, variant, theme, optimizedSize);
}
