// Movie recommendation flow using Genkit.

'use server';

/**
 * @fileOverview Provides personalized movie recommendations based on user viewing history.
 *
 * - getMovieRecommendations - A function to generate movie recommendations.
 * - MovieRecommendationInput - The input type for getMovieRecommendations.
 * - MovieRecommendationOutput - The output type for getMovieRecommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MovieRecommendationInputSchema = z.object({
  viewingHistory: z
    .string()
    .describe('The user viewing history as a comma separated list of movie titles.'),
});
export type MovieRecommendationInput = z.infer<typeof MovieRecommendationInputSchema>;

const MovieRecommendationOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A comma separated list of recommended movie titles based on viewing history.'),
});
export type MovieRecommendationOutput = z.infer<typeof MovieRecommendationOutputSchema>;

export async function getMovieRecommendations(input: MovieRecommendationInput): Promise<MovieRecommendationOutput> {
  return movieRecommendationFlow(input);
}

const movieRecommendationPrompt = ai.definePrompt({
  name: 'movieRecommendationPrompt',
  input: {schema: MovieRecommendationInputSchema},
  output: {schema: MovieRecommendationOutputSchema},
  prompt: `Based on the following viewing history: {{{viewingHistory}}}, what movies would you recommend? Return a comma separated list of movie titles.`,
});

const movieRecommendationFlow = ai.defineFlow(
  {
    name: 'movieRecommendationFlow',
    inputSchema: MovieRecommendationInputSchema,
    outputSchema: MovieRecommendationOutputSchema,
  },
  async input => {
    const {output} = await movieRecommendationPrompt(input);
    return output!;
  }
);
