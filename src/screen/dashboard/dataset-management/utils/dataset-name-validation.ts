import { z } from "zod";

/**
 * Zod schema for dataset name validation
 * Rules:
 * - Lowercase only
 * - No spaces
 * - Only underscore (_) allowed for joining
 * - Cannot start with a number
 */
export const datasetNameSchema = z
  .string()
  .min(1, "Dataset name is required")
  .trim()
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Dataset name must be lowercase, start with a letter, and only use underscore (_) to join words"
  );

/**
 * Validates dataset name using Zod schema
 */
export function validateDatasetName(name: string): {
  isValid: boolean;
  error?: string;
} {
  const result = datasetNameSchema.safeParse(name);

  if (result.success) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: result.error.issues[0]?.message || "Invalid dataset name",
  };
}

/**
 * Normalizes a dataset name by:
 * - Converting to lowercase
 * - Replacing spaces and special characters with underscores
 * - Removing leading numbers
 */
export function normalizeDatasetName(name: string): string {
  if (!name) return "";

  // Convert to lowercase
  let normalized = name.toLowerCase().trim();

  // Replace spaces and special characters with underscores
  normalized = normalized.replace(/[^a-z0-9_]/g, "_");

  // Remove consecutive underscores
  normalized = normalized.replace(/_+/g, "_");

  // Remove leading/trailing underscores
  normalized = normalized.replace(/^_+|_+$/g, "");

  // If starts with number, prefix with underscore
  if (/^\d/.test(normalized)) {
    normalized = `_${normalized}`;
  }

  return normalized;
}
