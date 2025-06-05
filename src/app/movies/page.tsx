"use client";
import { useEffect, useState } from 'react';
import type { Movie } from '@/lib/types';
import { getMovies } from '@/lib/data';
import MovieCard from '@/components/movies/movie-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Film } from 'lucide-react';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  
  const allGenres = movies.reduce((acc, movie) => {
    movie.genre.forEach(g => {
      if (!acc.includes(g)) acc.push(g);
    });
    return acc;
  }, [] as string[]).sort();

  useEffect(() => {
    async function fetchMovies() {
      setIsLoading(true);
      try {
        const data = await getMovies();
        setMovies(data);
        setFilteredMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        // Handle error state, e.g. show a toast
      } finally {
        setIsLoading(false);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    let currentMovies = [...movies];
    if (searchTerm) {
      currentMovies = currentMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (genreFilter !== 'all') {
      currentMovies = currentMovies.filter(movie => 
        movie.genre.includes(genreFilter)
      );
    }
    setFilteredMovies(currentMovies);
  }, [searchTerm, genreFilter, movies]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-headline text-primary">Now Showing</h1>
        <p className="text-lg text-muted-foreground font-body">
          Explore our latest collection of movies and book your tickets today!
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-card rounded-lg shadow">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {allGenres.map(genre => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Film size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">No movies match your criteria.</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
