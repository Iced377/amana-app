
'use server';
/**
 * @fileOverview AI flow for classifying user assets for Islamic inheritance.
 *
 * - classifyIslamicEstateAssets - Classifies assets based on file content/description and selected Madhhab.
 * - ClassifyIslamicEstateAssetsInput - Input type for the flow.
 * - ClassifiedAsset - Represents a single classified asset.
 * - ClassifyIslamicEstateAssetsOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Madhhab } from '@/types'; // Assuming Madhhab type is in global types

const AssetForClassificationSchema = z.object({
  id: z.string().describe('Unique ID of the asset/file.'),
  name: z.string().describe('Filename or description of the asset.'),
  type: z.string().optional().describe('File type or asset category (e.g., PDF, image, bank account, property).'),
  fileDataUri: z.string().optional().describe(
    "The file data as a data URI (if applicable). Format: 'data:<mimetype>;base64,<encoded_data>'. If the data URI is malformed or content is unreadable, rely on other provided metadata."
  ),
  manualDescription: z.string().optional().describe('User-provided description of the asset.'),
  size: z.number().optional().describe('File size in bytes, if applicable.'),
  estimatedUSDValue: z.number().optional().describe('User-provided estimated USD value of the asset.'),
});
export type AssetForClassification = z.infer<typeof AssetForClassificationSchema>;

const ClassifyIslamicEstateAssetsInputSchema = z.object({
  assets: z.array(AssetForClassificationSchema).describe('An array of assets to classify.'),
  madhhab: z.enum(['hanafi', 'maliki', 'shafii', 'hanbali', '']).describe('The Islamic school of thought (Madhhab) to apply for classification rules. Empty string if not specified (use general principles).'),
});
export type ClassifyIslamicEstateAssetsInput = z.infer<typeof ClassifyIslamicEstateAssetsInputSchema>;

const ClassifiedAssetSchema = z.object({
  assetId: z.string().describe('The ID of the original asset/file.'),
  assetName: z.string().describe('Original name/description of the asset.'),
  classification: z.enum(['Inheritable', 'Excluded', 'NeedsReview']).describe(
    'Classification: Inheritable (part of the Islamic estate), Excluded (not part of estate, e.g., trust for specific beneficiary, debts owed BY deceased), NeedsReview (requires user/expert review).'
  ),
  extractedValue: z.number().optional().describe('Estimated monetary value of the asset. This could be user-provided (in USD) or AI-extracted.'),
  currency: z.string().optional().describe('Currency of the extracted value (e.g., USD, SAR). If user provided estimatedUSDValue, this will be USD.'),
  reason: z.string().describe('Brief explanation for the classification, considering the Madhhab.'),
  details: z.string().optional().describe('Any other relevant details extracted or notes about the asset, including discrepancies between user-provided value and document content, or if file content was unusable.'),
});
export type ClassifiedAsset = z.infer<typeof ClassifiedAssetSchema>;

const ClassifyIslamicEstateAssetsOutputSchema = z.object({
  classifiedAssets: z.array(ClassifiedAssetSchema).describe('An array of classified assets.'),
});
export type ClassifyIslamicEstateAssetsOutput = z.infer<typeof ClassifyIslamicEstateAssetsOutputSchema>;


export async function classifyIslamicEstateAssets(input: ClassifyIslamicEstateAssetsInput): Promise<ClassifyIslamicEstateAssetsOutput> {
  if (!input.assets || input.assets.length === 0) {
    return { classifiedAssets: [] };
  }
  return classifyIslamicEstateAssetsFlow(input);
}

const classifyIslamicEstateAssetsPrompt = ai.definePrompt({
  name: 'classifyIslamicEstateAssetsPrompt',
  input: { schema: ClassifyIslamicEstateAssetsInputSchema },
  output: { schema: ClassifyIslamicEstateAssetsOutputSchema },
  prompt: `You are an AI assistant specialized in Islamic inheritance (Faraid and Wasiyyah) and asset classification according to different Madhahib (schools of thought).
Your task is to analyze a list of assets provided by a user and classify each asset as 'Inheritable', 'Excluded', or 'NeedsReview' for the purpose of calculating an Islamic estate.
You must also determine a monetary value and currency for each asset.

The user has selected the '{{{madhhab}}}' Madhhab. Apply its specific rules. If Madhhab is empty or not specified, use general Islamic principles.

General Principles for Classification:
- Inheritable: Assets owned outright by the deceased at the time of death (e.g., cash, bank balances, solely owned property, personal belongings with monetary value, business equity).
- Excluded:
    - Debts owed BY the deceased (these are paid BEFORE inheritance distribution).
    - Assets held in trust (Amanah) for others.
    - Funeral expenses.
    - Specifically designated Wasiyyah (bequest) up to 1/3 of the net estate (after debts/expenses) to non-heirs or charity. This is separate from Faraid. For classification, if an asset IS the Wasiyyah, mark as 'Excluded' (from Faraid calculation, but note it's a Wasiyyah).
    - Mehr (dower) owed to the wife if not paid.
    - Certain types of insurance payouts *depending on the policy structure and Madhhab*. Life insurance where beneficiaries are named directly might be Excluded from Faraid. If payout goes to estate, it's Inheritable.
    - Jointly owned assets: Only the deceased's share is Inheritable. The other owner's share is Excluded. If share is unclear, mark 'NeedsReview'.
- NeedsReview:
    - Assets with unclear ownership.
    - Complex financial instruments (e.g., derivatives, some types of bonds if Riba is involved - generally excluded but complex).
    - Insurance policies where beneficiary designation vs. estate payout is unclear.
    - Assets with potential Shariah compliance issues (e.g., investments in Haram businesses) - value might be inheritable but source needs review.
    - Waqf (Islamic endowment) properties are generally Excluded from Faraid as they are dedicated to charity/specific purpose.

Madhhab-Specific Considerations (Examples - you should use your knowledge):
- Hanafi: Generally, more emphasis on Asabah (residuaries). Joint property typically divided by determined shares.
- Maliki: Wasiyyah rules can be flexible. Life insurance may be viewed differently if premiums were from Halal sources and policy is Shariah-compliant.
- Shafi'i: Stricter on certain financial transactions. Clear distinction for assets acquired before/after marriage for spouses.
- Hanbali: Similar to Shafi'i but with some differences in handling specific types of property or debts.

For each asset in the input array 'assets':
1. Value Determination:
   - If a 'estimatedUSDValue' is provided by the user for this asset, use that as the 'extractedValue' and set 'currency' to 'USD'.
   - If 'estimatedUSDValue' is NOT provided, THEN analyze its name, type, manualDescription, and fileDataUri (if provided for content) to extract a monetary value and its currency.
   - If fileDataUri is present but seems malformed or its content is unreadable/irrelevant for value extraction, state this in the 'details' and rely on other metadata. If no value is found, omit 'extractedValue' and 'currency'.
2. Classification: Determine its classification: 'Inheritable', 'Excluded', or 'NeedsReview'.
3. Reason: Provide a concise 'reason' for your classification, referencing the {{{madhhab}}} Madhhab if specific rules apply.
4. Details: Add any other 'details' (e.g., "Value extracted from document title", "User provided USD value used.", "Original document mentioned 5000 EUR but user provided 5500 USD.", "File content was not usable for value extraction."). If 'estimatedUSDValue' was used, mention if this differs significantly from any value found in the content.

Asset List:
{{#each assets}}
- ID: {{this.id}}
  Name: {{this.name}}
  {{#if this.type}}Type: {{this.type}}{{/if}}
  {{#if this.estimatedUSDValue}}User Estimated USD Value: {{this.estimatedUSDValue}}{{/if}}
  {{#if this.manualDescription}}Description: {{this.manualDescription}}{{/if}}
  {{#if this.fileDataUri}}Content: {{media url=this.fileDataUri}} {{else}} (No file content provided) {{/if}}
  {{#if this.size}}Size: {{this.size}} bytes{{/if}}
---
{{/each}}

Return ONLY a JSON object matching the ClassifyIslamicEstateAssetsOutputSchema structure.
Ensure 'assetId' and 'assetName' in the output match the input asset's id and name/description.
If no value can be confidently extracted and no user value was provided, omit 'extractedValue' and 'currency'.
If an asset clearly states it is a "debt owed by deceased" or "funeral expenses", classify as 'Excluded'.
If the content of a file (fileDataUri) is unreadable or problematic, note this in the 'details' field for that asset and classify as 'NeedsReview' if other information is insufficient.
`,
  // Configure safety settings if dealing with potentially sensitive financial/personal data interpretation
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
});

const classifyIslamicEstateAssetsFlow = ai.defineFlow(
  {
    name: 'classifyIslamicEstateAssetsFlow',
    inputSchema: ClassifyIslamicEstateAssetsInputSchema,
    outputSchema: ClassifyIslamicEstateAssetsOutputSchema,
  },
  async (input) => {
    if (!input.assets || input.assets.length === 0) {
      return { classifiedAssets: [] };
    }
    const {output} = await classifyIslamicEstateAssetsPrompt(input);
    
    if (!output || !output.classifiedAssets) {
      // Handle cases where the prompt might not return a valid output (e.g., safety blocked, malformed response)
      // Create a 'NeedsReview' entry for each input asset
      console.warn('AI classification prompt did not return expected output. Marking assets for review.');
      const reviewAssets = input.assets.map(asset => ({
        assetId: asset.id,
        assetName: asset.name,
        classification: 'NeedsReview' as const,
        reason: "AI analysis could not be completed or returned an invalid response. Manual review required.",
        details: asset.fileDataUri ? "Attempted to process file content, but issues encountered." : "No file content provided or processed.",
      }));
      return { classifiedAssets: reviewAssets };
    }
    return output;
  }
);
