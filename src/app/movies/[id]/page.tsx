import { getMovieById } from '@/lib/data';
import MovieDetailsClient from '@/components/movies/movie-details';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovieById(params.id);
  if (!movie) {
    return {
      title: 'Movie Not Found',
    };
  }
  return {
    title: `${movie.title} | ReelTime Tickets`,
    description: movie.description,
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const movie = await getMovieById(params.id);

  if (!movie) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <Link href="/movies" className="mb-6 inline-flex items-center">
        <Button variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Back to Movies
        </Button>
      </Link>
      <MovieDetailsClient movie={movie} />
    </div>
  );
}
