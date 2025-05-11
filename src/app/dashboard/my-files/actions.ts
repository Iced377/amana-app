"use server";

import { autoTagFiles } from "@/ai/flows/auto-tag-files.ts";
import type { AutoTagFilesInput, AutoTagFilesOutput } from "@/ai/flows/auto-tag-files.ts";

export async function performAiTagging(input: AutoTagFilesInput): Promise<AutoTagFilesOutput> {
  try {
    // In a real app, you might first save the file to Firebase Storage,
    // then pass a GCS URI or public URL to the AI model if it supports that.
    // For this example, we're using data URI directly as per the flow's design.
    console.log("Performing AI tagging for:", input.filename);
    const result = await autoTagFiles(input);
    console.log("AI Tagging result:", result);
    return result;
  } catch (error) {
    console.error("Error in AI tagging server action:", error);
    // Return a default or error structure if needed
    return { tags: ["error", "tagging-failed"] };
  }
}
