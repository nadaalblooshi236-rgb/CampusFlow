'use server';
/**
 * @fileOverview License plate identification AI agent.
 *
 * - identifyLicensePlate - A function that identifies a license plate from an image.
 * - IdentifyLicensePlateInput - The input type for the identifyLicensePlate function.
 * - IdentifyLicensePlateOutput - The return type for the identifyLicensePlate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyLicensePlateInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a vehicle's license plate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyLicensePlateInput = z.infer<
  typeof IdentifyLicensePlateInputSchema
>;

const IdentifyLicensePlateOutputSchema = z.object({
  licensePlate: z
    .string()
    .describe('The identified license plate number. Should be in the format "ABC 12345".'),
});
export type IdentifyLicensePlateOutput = z.infer<
  typeof IdentifyLicensePlateOutputSchema
>;

export async function identifyLicensePlate(
  input: IdentifyLicensePlateInput
): Promise<IdentifyLicensePlateOutput> {
  return identifyLicensePlateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyLicensePlatePrompt',
  input: {schema: IdentifyLicensePlateInputSchema},
  output: {schema: IdentifyLicensePlateOutputSchema},
  prompt: `You are an expert at identifying vehicle license plates from images. Analyze the provided image and extract the license plate number. The license plate will be for the United Arab Emirates. It will have a three letter code and a 5 digit number. Return it in the format 'ABC 12345'.

Use the following as the primary source of information.

Photo: {{media url=photoDataUri}}`,
});

const identifyLicensePlateFlow = ai.defineFlow(
  {
    name: 'identifyLicensePlateFlow',
    inputSchema: IdentifyLicensePlateInputSchema,
    outputSchema: IdentifyLicensePlateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
