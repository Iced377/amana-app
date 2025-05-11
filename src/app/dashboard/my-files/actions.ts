
"use server";

import { autoTagFiles } from "@/ai/flows/auto-tag-files.ts";
import type { AutoTagFilesInput, AutoTagFilesOutput } from "@/ai/flows/auto-tag-files.ts";
import { shariahComplianceCheck } from "@/ai/flows/shariah-compliance-flow"; // New import
import type { ShariahComplianceInput, ShariahComplianceOutput } from "@/ai/flows/shariah-compliance-flow"; // New import

export async function performAiTagging(input: AutoTagFilesInput): Promise<AutoTagFilesOutput> {
  try {
    console.log("Performing AI tagging for:", input.filename);
    const result = await autoTagFiles(input);
    console.log("AI Tagging result:", result);
    return result;
  } catch (error) {
    console.error("Error in AI tagging server action:", error);
    return { tags: ["error", "tagging-failed"] };
  }
}

export async function performShariahComplianceCheck(input: ShariahComplianceInput): Promise<ShariahComplianceOutput> {
  try {
    console.log("Performing Shariah compliance check for:", input.filename);
    const result = await shariahComplianceCheck(input);
    console.log("Shariah Compliance Check result:", result);
    return result;
  } catch (error) {
    console.error("Error in Shariah compliance check server action:", error);
    return { 
      isCompliant: false, 
      reason: "Compliance check failed due to an error.",
      confidenceScore: 0 
    };
  }
}
