"use client";
import { useEffect, useState } from 'react';
import MovieForm from '@/components/admin/movie-form';
import type { Movie, MovieFormData } from '@/lib/types';
import { getMovieById, updateMovie } from '@/lib/data';
import { useRouter, useParams }sitemap from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id as string;
  const { toast } = useToast();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (movieId && user && user.role === 'admin') {
      async function fetchMovie() {
        setIsLoading(true);
        try {
          const data = await getMovieById(movieId);
          if (data) {
            setMovie(data);
          } else {
            toast({ title: "Error", description: "Movie not found.", variant: "destructive" });
            router.push('/admin/movies');
          }
        } catch (error) {
          console.error("Failed to fetch movie:", error);
          toast({ title: "Error", description: "Failed to load movie data.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovie();
    }
  }, [movieId, router, toast, user]);

  const handleSubmit = async (data: MovieFormData) => {
    setIsSubmitting(true);
    try {
      await updateMovie(movieId, data);
      toast({
        title: "Movie Updated",
        description: `${data.title} has been successfully updated.`,
      });
      router.push('/admin/movies');
    } catch (error) {
      console.error("Failed to update movie:", error);
      toast({
        title: "Error",
        description: "Failed to update movie. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    // This case should ideally be handled by redirect in useEffect, but as a fallback:
    return <p className="text-center">Movie data could not be loaded.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/movies" className="mb-6 inline-flex items-center">
        <Button variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Back to Movie List
        </Button>
      </Link>
      <MovieForm movie={movie} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
