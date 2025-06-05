"use client";
import type { Movie } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Calendar, Clock, Star, Ticket } from 'lucide-react';
import { formatDate } from '@/lib/data';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card border-border">
      <CardHeader className="p-0 relative">
        <Image
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          width={400}
          height={600}
          className="w-full h-72 object-cover"
          data-ai-hint="movie poster"
        />
         <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center">
            <Star size={14} className="mr-1 text-yellow-400" /> {movie.rating.toFixed(1)}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2 line-clamp-1">{movie.title}</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar size={14} className="mr-1" />
          <span>{formatDate(movie.releaseDate, 'yyyy')}</span>
          <span className="mx-2">|</span>
          <Clock size={14} className="mr-1" />
          <span>{movie.duration} min</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genre.slice(0,3).map((g) => (
            <span key={g} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full flex items-center">
              <Tag size={12} className="mr-1" /> {g}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{movie.description}</p>
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        <Link href={`/movies/${movie.id}`} className="w-full">
          <Button variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Ticket size={18} className="mr-2" /> View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
