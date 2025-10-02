'use server';
/**
 * @fileOverview Provides NFIQ 2.0 quality feedback for fingerprint images.
 *
 * - getNfiqQualityFeedback - A function that analyzes a fingerprint image and provides an NFIQ 2.0 score.
 * - NfiqQualityFeedbackInput - The input type for the function.
 * - NfiqQualityFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NfiqQualityFeedbackInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A fingerprint scan image to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type NfiqQualityFeedbackInput = z.infer<typeof NfiqQualityFeedbackInputSchema>;

const NfiqQualityFeedbackOutputSchema = z.object({
  nfiqScore: z.number().describe('An NFIQ 2.0 score representing the fingerprint image quality (0-100).'),
  feedback: z.string().describe('Specific feedback on how to improve the fingerprint scan quality.'),
});
export type NfiqQualityFeedbackOutput = z.infer<typeof NfiqQualityFeedbackOutputSchema>;

export async function getNfiqQualityFeedback(input: NfiqQualityFeedbackInput): Promise<NfiqQualityFeedbackOutput> {
  return nfiqQualityFeedbackFlow(input);
}

const nfiqQualityPrompt = ai.definePrompt({
  name: 'nfiqQualityPrompt',
  input: {schema: NfiqQualityFeedbackInputSchema},
  output: {schema: NfiqQualityFeedbackOutputSchema},
  prompt: `You are an expert in fingerprint quality assessment, specifically using the NFIQ 2.0 standard.

You will analyze the provided fingerprint image and return a quality score from 0 (unusable) to 100 (excellent), according to the NFIQ 2.0 specification. Also provide brief, actionable feedback for improving the scan.

Analyze the following fingerprint image:
{{media url=photoDataUri}}`,
    config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
        ],
    },
});

const nfiqQualityFeedbackFlow = ai.defineFlow(
  {
    name: 'nfiqQualityFeedbackFlow',
    inputSchema: NfiqQualityFeedbackInputSchema,
    outputSchema: NfiqQualityFeedbackOutputSchema,
  },
  async input => {
    const {output} = await nfiqQualityPrompt(input);
    return output!;
  }
);
