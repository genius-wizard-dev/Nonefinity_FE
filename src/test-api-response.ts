// Test helper for API response handling
// This file can be used to test the new API response format

import { DatasetService } from "./lib/datasetApi";

/**
 * Test function to verify API response handling
 * This simulates the API response format you mentioned:
 * {
 *   "success": true,
 *   "message": "Datasets listed successfully",
 *   "data": []
 * }
 */
export const testApiResponseHandling = async () => {
    try {
        console.log("Testing dataset list API response handling...");

        // This will call the actual API endpoint
        const result = await DatasetService.getDatasets(1, 10);

        console.log("API Response processed successfully:", {
            datasets: result.datasets,
            total: result.total,
            page: result.page,
            limit: result.limit,
        });

        // Verify the response structure
        if (Array.isArray(result.datasets)) {
            console.log("✅ Datasets array is properly handled");
            console.log(`✅ Found ${result.datasets.length} datasets`);

            if (result.datasets.length === 0) {
                console.log("✅ Empty dataset list handled correctly");
            }
        } else {
            console.error(
                "❌ Datasets is not an array:",
                typeof result.datasets
            );
        }

        return result;
    } catch (error) {
        console.error("❌ API call failed:", error);
        throw error;
    }
};

/**
 * Instructions for testing:
 *
 * 1. Open the browser console
 * 2. Import this test function in your component or page
 * 3. Call testApiResponseHandling() to verify the API handling
 *
 * Example usage in a React component:
 *
 * import { testApiResponseHandling } from './test-api-response';
 *
 * const handleTest = async () => {
 *   try {
 *     await testApiResponseHandling();
 *   } catch (error) {
 *     console.error('Test failed:', error);
 *   }
 * };
 */
