"use client";
import { useState } from 'react';
import { getMovieRecommendations, MovieRecommendationInput, MovieRecommendationOutput } from '@/ai/flows/movie-recommendations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MovieCard from './movie-card'; // Re-use movie card for displaying recommendations
import type { Movie } from '@/lib/types'; // Assuming Movie type
import { getMovies } from '@/lib/data'; // To fetch movie details for recommendations

export default function RecommendationForm() {
  const [viewingHistory, setViewingHistory] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recommendedMoviesDetails, setRecommendedMoviesDetails] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingHistory.trim()) {
      toast({ title: "Input Required", description: "Please enter some movies you've watched.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setRecommendations([]);
    setRecommendedMoviesDetails([]);

    try {
      const input: MovieRecommendationInput = { viewingHistory };
      const result: MovieRecommendationOutput = await getMovieRecommendations(input);
      const recommendedTitles = result.recommendations.split(',').map(title => title.trim()).filter(title => title);
      setRecommendations(recommendedTitles);
      
      // Fetch details for recommended movies
      if (recommendedTitles.length > 0) {
        const allMovies = await getMovies(); // This would ideally be a search against a movie DB
        const details = recommendedTitles.map(title => {
          const foundMovie = allMovies.find(m => m.title.toLowerCase() === title.toLowerCase());
          // Create a mock movie if not found, as AI might suggest movies not in our small DB
          return foundMovie || { 
            id: title.replace(/\s+/g, '-').toLowerCase(), // crude ID
            title: title, 
            description: `Details for "${title}" would be shown here.`, 
            posterUrl: 'https://placehold.co/400x600.png?text=' + encodeURIComponent(title), 
            genre: ['Unknown'], 
            duration: 0, 
            releaseDate: new Date().toISOString(), 
            director: 'N/A', 
            cast: [], 
            rating: 0,
            showtimes: []
          };
        });
        setRecommendedMoviesDetails(details);
      }

      toast({ title: "Recommendations Ready!", description: "Here are some movies you might like." });
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      toast({ title: "Error", description: "Could not fetch recommendations at this time.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary flex items-center">
          <Sparkles size={28} className="mr-2 text-accent" /> Personalized Movie Recommendations
        </CardTitle>
        <CardDescription>
          Tell us a few movies you've enjoyed, and we'll suggest what to watch next!
          Separate movie titles with commas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="viewingHistory" className="font-semibold">Your Watched Movies</Label>
            <Textarea
              id="viewingHistory"
              value={viewingHistory}
              onChange={(e) => setViewingHistory(e.target.value)}
              placeholder="e.g., Inception, The Matrix, Interstellar"
              rows={3}
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Finding Movies...' : 'Get Recommendations'}
          </Button>
        </form>
      </CardContent>
      
      {recommendations.length > 0 && (
        <CardFooter className="flex-col items-start space-y-4 pt-6 border-t">
          <h3 className="text-2xl font-headline text-primary">Our Suggestions For You:</h3>
          {recommendedMoviesDetails.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {recommendedMoviesDetails.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <ul className="list-disc list-inside space-y-1 pl-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Film size={16} className="text-muted-foreground" /> {rec}
                </li>
              ))}
            </ul>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
