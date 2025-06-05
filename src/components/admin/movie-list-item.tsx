"use client";
import type { Movie } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Trash2, Calendar, Clock, Tag } from 'lucide-react';
import { formatDate } from '@/lib/data';

interface MovieListItemProps {
  movie: Movie;
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
}

export default function MovieListItem({ movie, onDelete, isDeleting }: MovieListItemProps) {
  return (
    <Card className="flex flex-col md:flex-row overflow-hidden shadow-lg">
      <div className="md:w-1/4 relative h-48 md:h-auto">
         <Image
          src={movie.posterUrl || 'https://placehold.co/300x450.png?text=No+Image'}
          alt={`${movie.title} poster`}
          width={300}
          height={450}
          className="w-full h-full object-cover"
          data-ai-hint="movie poster"
        />
      </div>
      <div className="md:w-3/4 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="font-headline text-xl">{movie.title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">ID: {movie.id}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-1.5 flex-grow pt-0 pb-3">
          <p className="flex items-center"><Calendar size={14} className="mr-1.5 text-accent" /> Released: {formatDate(movie.releaseDate)}</p>
          <p className="flex items-center"><Clock size={14} className="mr-1.5 text-accent" /> Duration: {movie.duration} min</p>
          <p className="flex items-center"><Tag size={14} className="mr-1.5 text-accent" /> Genres: {movie.genre.join(', ')}</p>
          <p className="line-clamp-2 text-muted-foreground">{movie.description}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t p-3">
          <Link href={`/admin/movies/${movie.id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <Edit3 size={16} className="mr-1.5" /> Edit
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(movie.id, movie.title)}
            disabled={isDeleting}
            className="flex items-center"
          >
            <Trash2 size={16} className="mr-1.5" /> {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
