"use client";
import { useEffect, useState } from 'react';
import type { Movie } from '@/lib/types';
import { getMovies, deleteMovie } from '@/lib/data';
import MovieListItem from '@/components/admin/movie-list-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Loader2, Film, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingMovie, setDeletingMovie] = useState<{ id: string; title: string } | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

 useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    if(user && user.role === 'admin'){
        async function fetchMovies() {
        setIsLoading(true);
        try {
            const data = await getMovies();
            setMovies(data);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
            toast({ title: "Error", description: "Failed to load movies.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
        }
        fetchMovies();
    }
  }, [toast, user]);

  const handleDeleteClick = (id: string, title: string) => {
    setDeletingMovie({ id, title });
  };

  const confirmDelete = async () => {
    if (!deletingMovie) return;
    setIsProcessingDelete(true);
    try {
      await deleteMovie(deletingMovie.id);
      setMovies(prev => prev.filter(movie => movie.id !== deletingMovie.id));
      toast({ title: "Movie Deleted", description: `${deletingMovie.title} has been successfully deleted.` });
    } catch (error) {
      console.error("Failed to delete movie:", error);
      toast({ title: "Error", description: "Failed to delete movie.", variant: "destructive" });
    } finally {
      setIsProcessingDelete(false);
      setDeletingMovie(null);
    }
  };

  if (authLoading || isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b">
        <div>
            <h1 className="text-4xl font-headline text-primary flex items-center">
                <Film size={36} className="mr-3 text-accent"/> Manage Movies
            </h1>
            <p className="text-lg text-muted-foreground font-body mt-1">View, add, edit, or delete movie listings.</p>
        </div>
        <Link href="/admin/movies/add">
          <Button className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle size={20} className="mr-2" /> Add New Movie
          </Button>
        </Link>
      </header>

      {movies.length > 0 ? (
        <div className="space-y-6">
          {movies.map((movie) => (
            <MovieListItem 
              key={movie.id} 
              movie={movie} 
              onDelete={() => handleDeleteClick(movie.id, movie.title)}
              isDeleting={isProcessingDelete && deletingMovie?.id === movie.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          <Film size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">No Movies Found</h2>
          <p className="text-muted-foreground">There are no movies in the database yet. Add one to get started!</p>
        </div>
      )}

      {deletingMovie && (
        <AlertDialog open={!!deletingMovie} onOpenChange={() => setDeletingMovie(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the movie "{deletingMovie.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessingDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isProcessingDelete} className="bg-destructive hover:bg-destructive/90">
                {isProcessingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
