'use server';
/**
 * @fileOverview Provides real-time feedback on image quality (blur, lighting, etc.).
 *
 * - getImageQualityFeedback - A function that analyzes an image and provides feedback.
 * - ImageQualityFeedbackInput - The input type for the getImageQualityFeedback function.
 * - ImageQualityFeedbackOutput - The return type for the getImageQualityFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageQualityFeedbackInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageQualityFeedbackInput = z.infer<typeof ImageQualityFeedbackInputSchema>;

const ImageQualityFeedbackOutputSchema = z.object({
  qualityScore: z.number().describe('A score representing the overall image quality (0-100).'),
  blurLevel: z.string().describe('Qualitative assessment of blur level (e.g., low, moderate, high).'),
  lightingCondition: z.string().describe('Description of lighting conditions (e.g., well-lit, dim, overexposed).'),
  feedback: z.string().describe('Specific feedback on how to improve image quality.'),
});
export type ImageQualityFeedbackOutput = z.infer<typeof ImageQualityFeedbackOutputSchema>;

export async function getImageQualityFeedback(input: ImageQualityFeedbackInput): Promise<ImageQualityFeedbackOutput> {
  return imageQualityFeedbackFlow(input);
}

const imageQualityPrompt = ai.definePrompt({
  name: 'imageQualityPrompt',
  input: {schema: ImageQualityFeedbackInputSchema},
  output: {schema: ImageQualityFeedbackOutputSchema},
  prompt: `You are an expert in image quality assessment.

You will analyze the provided image and provide feedback on its quality, including blur level and lighting conditions.

Based on your analysis, provide a quality score (0-100), a qualitative assessment of blur level (e.g., low, moderate, high), a description of lighting conditions (e.g., well-lit, dim, overexposed), and specific feedback on how to improve the image quality.

Analyze the following image:
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

const imageQualityFeedbackFlow = ai.defineFlow(
  {
    name: 'imageQualityFeedbackFlow',
    inputSchema: ImageQualityFeedbackInputSchema,
    outputSchema: ImageQualityFeedbackOutputSchema,
  },
  async input => {
    const {output} = await imageQualityPrompt(input);
    return output!;
  }
);
