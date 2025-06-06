"use client";
import type { Booking } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Film, MapPin, Trash2, Users, TicketIcon, Edit3 } from 'lucide-react';
import { formatDateTime } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

interface BookingCardProps {
  booking: Booking;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isCancelling: boolean;
}

export default function BookingCard({ booking, onCancelBooking, isCancelling }: BookingCardProps) {
  const posterUrl = `https://placehold.co/150x225.png?text=${encodeURIComponent(booking.movieTitle)}`;
  const canModifyOrCancel = new Date(booking.showtimeDateTime) > new Date();

  return (
    <Card className="overflow-hidden shadow-lg flex flex-col md:flex-row">
      <div className="md:w-1/4 relative">
        <Image 
          src={posterUrl} 
          alt={`${booking.movieTitle} Poster`} 
          width={150} 
          height={225} 
          className="w-full h-full object-cover"
          data-ai-hint="movie poster"
        />
      </div>
      <div className="md:w-3/4 flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{booking.movieTitle}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Booking ID: {booking.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <p className="flex items-center"><TicketIcon size={16} className="mr-2 text-accent" /> Seats: <span className="font-semibold ml-1">{booking.selectedSeats.join(', ')}</span></p>
            <p className="flex items-center"><MapPin size={16} className="mr-2 text-accent" /> Theatre: <span className="font-semibold ml-1">{booking.theatreName}</span></p>
            <p className="flex items-center col-span-full"><CalendarDays size={16} className="mr-2 text-accent" /> Showtime: <span className="font-semibold ml-1">{formatDateTime(booking.showtimeDateTime)}</span></p>
            <p className="flex items-center"><Users size={16} className="mr-2 text-accent" /> Total Price: <span className="font-semibold ml-1">${booking.totalPrice.toFixed(2)}</span></p>
            <p className="flex items-center"><Clock size={16} className="mr-2 text-accent" /> Booked On: <span className="font-semibold ml-1">{formatDateTime(booking.bookingTime)}</span></p>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 flex flex-col sm:flex-row justify-end gap-2">
          {canModifyOrCancel ? (
            <>
              <Link href={`/movies/${booking.movieId}/book?showtimeId=${booking.showtimeId}&bookingId=${booking.id}&modify=true`}>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Edit3 size={16} className="mr-2" /> Modify Seats
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onCancelBooking(booking.id)}
                disabled={isCancelling}
                className="w-full sm:w-auto"
              >
                <Trash2 size={16} className="mr-2" /> {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center sm:text-right">This booking can no longer be modified or cancelled.</p>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
