'use server';
/**
 * @fileOverview This file contains the Genkit flow for detecting if a new file is a duplicate of existing files.
 *
 * The flow analyzes the target file's content and metadata against a list of existing files' metadata.
 *
 * @interface DetectDuplicateInput - Defines the input for the detectDuplicateFile flow.
 * @interface DetectDuplicateOutput - Defines the output, indicating if a duplicate is found and details.
 * @function detectDuplicateFile - The main function to initiate the duplicate detection process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExistingFileMetadataSchema = z.object({
  id: z.string().describe('The unique ID of the existing file.'),
  name: z.string().describe('The name of the existing file.'),
  type: z.string().describe('The type/category of the existing file (e.g., document, image).'),
  size: z.number().describe('The size of the existing file in bytes.'),
  uploadDate: z.string().describe('The ISO string timestamp of when the existing file was uploaded.'),
});

const DetectDuplicateInputSchema = z.object({
  targetFileDataUri: z
    .string()
    .describe(
      "The target file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetFileName: z.string().describe('The name of the target file being checked.'),
  targetFileType: z.string().describe('The type/category of the target file (e.g., document, image).'),
  targetFileSize: z.number().describe('The size of the target file in bytes.'),
  existingFilesMetadata: z
    .array(ExistingFileMetadataSchema)
    .describe('An array of metadata objects for existing files to compare against.'),
});
export type DetectDuplicateInput = z.infer<typeof DetectDuplicateInputSchema>;

const DetectDuplicateOutputSchema = z.object({
  isDuplicate: z.boolean().describe('True if the Target File is a duplicate of an existing file, false otherwise.'),
  duplicateOfFileId: z.string().optional().describe('ID of the existing file it is a duplicate of, if isDuplicate is true.'),
  confidenceScore: z.number().min(0).max(1).describe('A score from 0 to 1 indicating the AI model\'s confidence in its duplication assessment.'),
  reason: z.string().optional().describe('A brief explanation for the duplication assessment (e.g., "Content appears identical to file X", "Filename and size match file Y").'),
});
export type DetectDuplicateOutput = z.infer<typeof DetectDuplicateOutputSchema>;

export async function detectDuplicateFile(input: DetectDuplicateInput): Promise<DetectDuplicateOutput> {
  // If there are no existing files, it cannot be a duplicate.
  if (!input.existingFilesMetadata || input.existingFilesMetadata.length === 0) {
    return {
      isDuplicate: false,
      confidenceScore: 0,
      reason: "No existing files to compare against.",
    };
  }
  return detectDuplicateFileFlow(input);
}

const detectDuplicateFilePrompt = ai.definePrompt({
  name: 'detectDuplicateFilePrompt',
  input: {schema: DetectDuplicateInputSchema},
  output: {schema: DetectDuplicateOutputSchema},
  prompt: `You are an AI assistant specializing in detecting duplicate files.
Analyze the 'Target File' (content and metadata) and compare it against the 'Existing Files Metadata'.
Determine if the 'Target File' is a duplicate of ANY of the 'Existing Files'.

Consider similarities in:
- Filename: Ignore case. Look for common duplicate indicators like "copy", "(1)", "(2)", etc. or very minor variations.
- File Type: Must be identical or very similar (e.g. jpg vs jpeg).
- File Size: Must be identical or very close (e.g., within +/- 1-2% difference).
- Upload Date Proximity: Files uploaded very close in time with other similar metadata might be duplicates.

The content of the 'Target File' (provided as media) is the most crucial factor if metadata suggests a strong similarity to an existing file. If content is available and metadata is close, prioritize content analysis.

Target File:
Name: {{{targetFileName}}}
Type: {{{targetFileType}}}
Size: {{{targetFileSize}}} bytes
Content: {{media url=targetFileDataUri}}

Existing Files (Metadata):
{{#if existingFilesMetadata}}
{{#each existingFilesMetadata}}
- ID: {{this.id}}, Name: {{this.name}}, Type: {{this.type}}, Size: {{this.size}} bytes, Uploaded: {{this.uploadDate}}
{{/each}}
{{else}}
No existing files to compare against. The Target File cannot be a duplicate.
{{/if}}

Return ONLY a JSON object matching the DetectDuplicateOutputSchema.
If the Target File is not a duplicate of any existing file, "isDuplicate" must be false.
If "isDuplicate" is true, "duplicateOfFileId" must be the ID of the existing file it matches.
"confidenceScore" should reflect your certainty.
"reason" should briefly state why it's considered a duplicate or not. Example reasons: "Filename, size, and type are nearly identical to file X.", "Content analysis suggests strong similarity to file Y.", "Metadata differs significantly from all existing files."
`,
});

const detectDuplicateFileFlow = ai.defineFlow(
  {
    name: 'detectDuplicateFileFlow',
    inputSchema: DetectDuplicateInputSchema,
    outputSchema: DetectDuplicateOutputSchema,
  },
  async (input) => {
    if (!input.existingFilesMetadata || input.existingFilesMetadata.length === 0) {
      return {
        isDuplicate: false,
        confidenceScore: 0,
        reason: "No existing files to compare against.",
      };
    }
    const {output} = await detectDuplicateFilePrompt(input);
    
    if (!output) {
        // Handle cases where the prompt might not return a valid output
        return {
            isDuplicate: false,
            confidenceScore: 0.1, // Low confidence due to error
            reason: "AI analysis could not be completed or returned an invalid response.",
        };
    }
    // Ensure that if isDuplicate is false, duplicateOfFileId is not set or is null/undefined.
    if (!output.isDuplicate) {
      output.duplicateOfFileId = undefined;
    }
    return output;
  }
);
