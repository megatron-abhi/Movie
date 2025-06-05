"use client";
import { useState } from 'react';
import MovieForm from '@/components/admin/movie-form';
import type { MovieFormData } from '@/lib/types';
import { addMovie } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';


export default function AddMoviePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);


  const handleSubmit = async (data: MovieFormData) => {
    setIsSubmitting(true);
    try {
      await addMovie(data);
      toast({
        title: "Movie Added",
        description: `${data.title} has been successfully added.`,
      });
      router.push('/admin/movies');
    } catch (error) {
      console.error("Failed to add movie:", error);
      toast({
        title: "Error",
        description: "Failed to add movie. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/movies" className="mb-6 inline-flex items-center">
        <Button variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Back to Movie List
        </Button>
      </Link>
      <MovieForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
