'use server';

/**
 * @fileOverview This file contains the Genkit flow for automatically tagging uploaded files using AI.
 *
 * The flow analyzes the content of the file and suggests tags like 'Insurance', 'Will', 'Personal', or 'Legal'.
 *
 * @interface AutoTagFilesInput - Defines the input for the autoTagFiles flow.
 * @interface AutoTagFilesOutput - Defines the output of the autoTagFiles flow, which includes suggested tags.
 * @function autoTagFiles - The main function to initiate the auto-tagging process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoTagFilesInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The file data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  filename: z.string().describe('The name of the file being tagged.'),
  fileType: z.string().describe('The type of the file being tagged (e.g., pdf, image, docx).'),
});
export type AutoTagFilesInput = z.infer<typeof AutoTagFilesInputSchema>;

const AutoTagFilesOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe(
      'An array of suggested tags for the file, such as Insurance, Will, Personal, or Legal.'
    ),
});
export type AutoTagFilesOutput = z.infer<typeof AutoTagFilesOutputSchema>;

export async function autoTagFiles(input: AutoTagFilesInput): Promise<AutoTagFilesOutput> {
  return autoTagFilesFlow(input);
}

const autoTagFilesPrompt = ai.definePrompt({
  name: 'autoTagFilesPrompt',
  input: {schema: AutoTagFilesInputSchema},
  output: {schema: AutoTagFilesOutputSchema},
  prompt: `You are an AI assistant designed to analyze files and suggest appropriate tags for them.

  Based on the content of the file, suggest relevant tags from the following categories: Insurance, Will, Personal, Legal.

  Consider the filename, file type, and the content of the file when suggesting tags.

  Return ONLY a JSON object with a "tags" array of strings.

  Filename: {{{filename}}}
  File Type: {{{fileType}}}
  File Content: {{media url=fileDataUri}}
  `,
});

const autoTagFilesFlow = ai.defineFlow(
  {
    name: 'autoTagFilesFlow',
    inputSchema: AutoTagFilesInputSchema,
    outputSchema: AutoTagFilesOutputSchema,
  },
  async input => {
    const {output} = await autoTagFilesPrompt(input);
    return output!;
  }
);
