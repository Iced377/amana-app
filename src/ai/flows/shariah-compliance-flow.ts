
'use server';
/**
 * @fileOverview This file contains the Genkit flow for checking Shariah compliance of uploaded files using AI.
 *
 * The flow analyzes the file content and metadata to flag assets that might not be Shariah-compliant.
 *
 * @interface ShariahComplianceInput - Defines the input for the shariahComplianceCheck flow.
 * @interface ShariahComplianceOutput - Defines the output, indicating compliance status and reasoning.
 * @function shariahComplianceCheck - The main function to initiate the compliance check.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShariahComplianceInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  filename: z.string().describe('The name of the file.'),
  fileType: z.string().describe('The MIME type or general type of the file (e.g., image/jpeg, application/pdf, video/mp4).'),
  // Optional: user-provided description or context about the asset
  userDescription: z.string().optional().describe('Optional user-provided context or description of the asset.'),
});
export type ShariahComplianceInput = z.infer<typeof ShariahComplianceInputSchema>;

const ShariahComplianceOutputSchema = z.object({
  isCompliant: z.boolean().describe('True if the asset is likely Shariah-compliant, false otherwise.'),
  reason: z.string().describe('A brief explanation for the compliance status, especially if not compliant or uncertain.'),
  confidenceScore: z.number().min(0).max(1).describe('A score from 0 to 1 indicating the AI model\'s confidence in its assessment.'),
  categoriesConcerned: z.array(z.string()).optional().describe('If not compliant, lists potential categories of concern (e.g., Riba, Gharar, Haram content).'),
});
export type ShariahComplianceOutput = z.infer<typeof ShariahComplianceOutputSchema>;

export async function shariahComplianceCheck(input: ShariahComplianceInput): Promise<ShariahComplianceOutput> {
  return shariahComplianceFlow(input);
}

const shariahCompliancePrompt = ai.definePrompt({
  name: 'shariahCompliancePrompt',
  input: {schema: ShariahComplianceInputSchema},
  output: {schema: ShariahComplianceOutputSchema},
  prompt: `You are an AI assistant specialized in evaluating digital assets for Shariah compliance based on general Islamic principles.
  Analyze the provided file content, filename, file type, and any user description.

  Consider common Shariah prohibitions such as:
  - Riba (interest)
  - Gharar (excessive uncertainty or speculation)
  - Maysir (gambling)
  - Haram (forbidden) industries or content (e.g., alcohol, pork, prohibited imagery, unethical investments, specific financial instruments like conventional insurance or bonds that involve Riba/Gharar).

  Based on your analysis, determine if the asset is likely Shariah-compliant.
  Provide a confidence score for your assessment.
  If the asset is deemed non-compliant or uncertain, specify the reason and any categories of concern.

  File Details:
  Filename: {{{filename}}}
  File Type: {{{fileType}}}
  {{#if userDescription}}User Description: {{{userDescription}}}{{/if}}
  File Content: {{media url=fileDataUri}}

  Return your assessment ONLY as a JSON object matching the ShariahComplianceOutputSchema.
  Example of non-compliant: { "isCompliant": false, "reason": "The document appears to be a contract for a conventional loan with interest.", "confidenceScore": 0.85, "categoriesConcerned": ["Riba"] }
  Example of compliant: { "isCompliant": true, "reason": "The image is a personal photo and does not contain prohibited content.", "confidenceScore": 0.95 }
  Example of uncertain: { "isCompliant": false, "reason": "The document mentions investments but lacks details to confirm Shariah compliance. It may involve Gharar.", "confidenceScore": 0.60, "categoriesConcerned": ["Gharar", "Uncertain Investment"] }
  `,
   // Stricter safety settings for potentially sensitive content analysis
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const shariahComplianceFlow = ai.defineFlow(
  {
    name: 'shariahComplianceFlow',
    inputSchema: ShariahComplianceInputSchema,
    outputSchema: ShariahComplianceOutputSchema,
  },
  async (input) => {
    // In a real application, you might add pre-processing or context enrichment here.
    // For example, if the file is a PDF, you might extract text first if the model struggles with direct PDF media.
    // However, Gemini models are generally good with multimodal inputs.

    const {output} = await shariahCompliancePrompt(input);
    
    if (!output) {
        // Handle cases where the prompt might not return a valid output (e.g. safety blocked)
        return {
            isCompliant: false, // Default to non-compliant or uncertain in case of error
            reason: "AI analysis could not be completed or returned an invalid response. Manual review recommended.",
            confidenceScore: 0.1, // Low confidence due to error
            categoriesConcerned: ["AI Error"]
        };
    }
    return output;
  }
);

// Example usage (for testing purposes, not part of the deployed flow)
/*
async function testFlow() {
  const testInput: ShariahComplianceInput = {
    // Replace with a real Base64 Data URI of a test file
    fileDataUri: "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==", // "Hello, World!"
    filename: "test.txt",
    fileType: "text/plain",
    userDescription: "A simple test file."
  };
  try {
    const result = await shariahComplianceCheck(testInput);
    console.log("Test Shariah Compliance Result:", result);
  } catch (error) {
    console.error("Test Shariah Compliance Error:", error);
  }
}
// testFlow();
*/
