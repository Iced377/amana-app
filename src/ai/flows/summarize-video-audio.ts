// 'use server';

/**
 * @fileOverview Summarizes video and audio uploads using AI.
 *
 * - summarizeVideoAudio - A function that summarizes video/audio content.
 * - SummarizeVideoAudioInput - The input type for the summarizeVideoAudio function.
 * - SummarizeVideoAudioOutput - The return type for the summarizeVideoAudio function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVideoAudioInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A video or audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe('Optional description of the video or audio.'),
});
export type SummarizeVideoAudioInput = z.infer<typeof SummarizeVideoAudioInputSchema>;

const SummarizeVideoAudioOutputSchema = z.object({
  summary: z
    .string()
    .describe('A short AI-generated summary of the video or audio content.'),
});
export type SummarizeVideoAudioOutput = z.infer<typeof SummarizeVideoAudioOutputSchema>;

export async function summarizeVideoAudio(input: SummarizeVideoAudioInput): Promise<SummarizeVideoAudioOutput> {
  return summarizeVideoAudioFlow(input);
}

const summarizeVideoAudioPrompt = ai.definePrompt({
  name: 'summarizeVideoAudioPrompt',
  input: {schema: SummarizeVideoAudioInputSchema},
  output: {schema: SummarizeVideoAudioOutputSchema},
  prompt: `You are an AI assistant tasked with creating short summaries of video and audio files for archival purposes.

  Given the following video or audio content, create a concise summary that captures the main message or purpose of the recording. The summary should be no more than one sentence long and should be easily understood by someone who has never seen or heard the recording. Focus on the key information that would be most helpful for beneficiaries to understand the content quickly.

  Description: {{description}}
  Media: {{media url=mediaDataUri}}

  Summary:`,
});

const summarizeVideoAudioFlow = ai.defineFlow(
  {
    name: 'summarizeVideoAudioFlow',
    inputSchema: SummarizeVideoAudioInputSchema,
    outputSchema: SummarizeVideoAudioOutputSchema,
  },
  async input => {
    const {output} = await summarizeVideoAudioPrompt(input);
    return output!;
  }
);
