
"use server";

import { autoTagFiles } from "@/ai/flows/auto-tag-files";
import type { AutoTagFilesInput, AutoTagFilesOutput } from "@/ai/flows/auto-tag-files";
import { shariahComplianceCheck } from "@/ai/flows/shariah-compliance-flow";
import type { ShariahComplianceInput, ShariahComplianceOutput } from "@/ai/flows/shariah-compliance-flow";
import { detectDuplicateFile } from "@/ai/flows/detect-duplicate-file"; // New import
import type { DetectDuplicateInput, DetectDuplicateOutput } from "@/ai/flows/detect-duplicate-file"; // New import

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

export async function performDuplicateCheck(input: DetectDuplicateInput): Promise<DetectDuplicateOutput> {
  try {
    console.log("Performing duplicate check for:", input.targetFileName);
    if (!input.existingFilesMetadata || input.existingFilesMetadata.length === 0) {
      return {
        isDuplicate: false,
        confidenceScore: 0,
        reason: "No existing files to compare against for duplication.",
      };
    }
    const result = await detectDuplicateFile(input);
    console.log("Duplicate Check result:", result);
    return result;
  } catch (error) {
    console.error("Error in duplicate check server action:", error);
    return {
      isDuplicate: false,
      confidenceScore: 0.1,
      reason: "Duplicate check failed due to an error.",
    };
  }
}
