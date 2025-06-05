"use client";
import type { Movie, Showtime } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Star, Users, Video, Tag, Ticket, ChevronRight } from 'lucide-react';
import { formatDate, formatTime, formatDateTime } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MovieDetailsProps {
  movie: Movie;
}

export default function MovieDetailsClient({ movie }: MovieDetailsProps) {
  const today = new Date().setHours(0,0,0,0);
  const upcomingShowtimes = movie.showtimes
    .filter(st => new Date(st.dateTime).setHours(0,0,0,0) >= today)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const groupShowtimesByDate = (showtimes: Showtime[]) => {
    return showtimes.reduce((acc, showtime) => {
      const dateKey = formatDate(showtime.dateTime, 'EEEE, MMMM d, yyyy');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(showtime);
      return acc;
    }, {} as Record<string, Showtime[]>);
  };

  const groupedShowtimes = groupShowtimesByDate(upcomingShowtimes);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            width={600}
            height={900}
            className="rounded-lg shadow-xl w-full object-cover"
            data-ai-hint="movie poster"
          />
        </div>
        <div className="md:col-span-2 space-y-6">
          <h1 className="font-headline text-4xl md:text-5xl text-primary">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center"><Star size={18} className="mr-1 text-yellow-400" /> {movie.rating.toFixed(1)}/5.0</span>
            <span className="flex items-center"><Calendar size={18} className="mr-1" /> {formatDate(movie.releaseDate, 'MMMM d, yyyy')}</span>
            <span className="flex items-center"><Clock size={18} className="mr-1" /> {movie.duration} min</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {movie.genre.map(g => (
              <Badge key={g} variant="secondary" className="text-sm px-3 py-1 flex items-center gap-1">
                <Tag size={14} /> {g}
              </Badge>
            ))}
          </div>
          
          <p className="text-lg leading-relaxed font-body">{movie.description}</p>

          <div>
            <h3 className="font-headline text-xl mb-1">Director</h3>
            <p className="text-muted-foreground">{movie.director}</p>
          </div>
          <div>
            <h3 className="font-headline text-xl mb-1">Cast</h3>
            <p className="text-muted-foreground">{movie.cast.join(', ')}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center text-accent">
            <Ticket size={30} className="mr-3" /> Book Your Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.keys(groupedShowtimes).length > 0 ? (
            Object.entries(groupedShowtimes).map(([date, showtimesOnDate]) => (
              <div key={date}>
                <h3 className="font-headline text-xl mb-3 border-b border-border pb-2">{date}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {showtimesOnDate.map(showtime => (
                    <Link key={showtime.id} href={`/movies/${movie.id}/book?showtimeId=${showtime.id}`}>
                      <Button variant="outline" className="w-full h-auto p-3 flex flex-col items-start text-left hover:bg-accent/10 hover:border-accent transition-all duration-200">
                        <div className="font-semibold text-lg">{formatTime(showtime.dateTime)}</div>
                        <div className="text-sm text-muted-foreground">{showtime.theatreName}</div>
                        <div className={`text-xs mt-1 ${showtime.availableSeats > 10 ? 'text-green-400' : 'text-red-400'}`}>
                          {showtime.availableSeats} seats left
                        </div>
                         <div className="mt-2 text-xs w-full flex justify-end items-center text-accent">
                           Book Now <ChevronRight size={16} className="ml-1" />
                         </div>
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No upcoming showtimes available for this movie.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
