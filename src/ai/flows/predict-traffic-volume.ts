'use server';

/**
 * @fileOverview Traffic volume prediction AI agent.
 *
 * - predictTrafficVolume - A function that predicts traffic volume at the gate.
 * - PredictTrafficVolumeInput - The input type for the predictTrafficVolume function.
 * - PredictTrafficVolumeOutput - The return type for the predictTrafficVolume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTrafficVolumeInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical traffic data, including date, time, and number of vehicles.'
    ),
  currentConditions: z
    .string()
    .describe(
      'Current conditions, including weather, day of the week, and any special events.'
    ),
});
export type PredictTrafficVolumeInput = z.infer<typeof PredictTrafficVolumeInputSchema>;

const PredictTrafficVolumeOutputSchema = z.object({
  predictedVolume: z
    .string()
    .describe(
      'The predicted traffic volume at the gate, including a time.'
    ),
  suggestedAdjustments: z
    .string()
    .describe(
      'Suggested adjustments to gate operation schedules and staffing to minimize congestion.'
    ),
});
export type PredictTrafficVolumeOutput = z.infer<typeof PredictTrafficVolumeOutputSchema>;

export async function predictTrafficVolume(
  input: PredictTrafficVolumeInput
): Promise<PredictTrafficVolumeOutput> {
  return predictTrafficVolumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTrafficVolumePrompt',
  input: {schema: PredictTrafficVolumeInputSchema},
  output: {schema: PredictTrafficVolumeOutputSchema},
  prompt: `You are an AI-powered tool that analyzes historical traffic data and current conditions to predict traffic volume at the gate.

  You will use this information to predict traffic volume at the gate, so you can adjust gate operation schedules and staffing to minimize congestion and optimize vehicle flow during peak hours.

  Use the following as the primary source of information about the plant.

  Historical Data: {{{historicalData}}}
Current Conditions: {{{currentConditions}}}`,
});

const predictTrafficVolumeFlow = ai.defineFlow(
  {
    name: 'predictTrafficVolumeFlow',
    inputSchema: PredictTrafficVolumeInputSchema,
    outputSchema: PredictTrafficVolumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
