"use client";
import { useEffect, useState } from 'react';
import type { Booking } from '@/lib/types';
import { getUserBookings, cancelBooking } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import BookingCard from '@/components/bookings/booking-card';
import { Loader2, Ticket, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      async function fetchBookings() {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getUserBookings(user.id);
          // Sort by showtime date, most recent first
          data.sort((a, b) => new Date(b.showtimeDateTime).getTime() - new Date(a.showtimeDateTime).getTime());
          setBookings(data);
        } catch (err) {
          console.error("Failed to fetch bookings:", err);
          setError("Could not load your bookings. Please try again later.");
          toast({ title: "Error", description: "Failed to load bookings.", variant: "destructive"});
        } finally {
          setIsLoading(false);
        }
      }
      fetchBookings();
    } else if (!authLoading) {
      // If user is not logged in and auth is not loading, stop loading page.
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    setCancellingId(bookingId);
    try {
      const success = await cancelBooking(bookingId, user.id);
      if (success) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        toast({ title: "Booking Cancelled", description: "Your booking has been successfully cancelled." });
      } else {
        toast({ title: "Cancellation Failed", description: "Could not cancel booking. It might have already passed or an error occurred.", variant: "destructive"});
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      toast({ title: "Cancellation Error", description: "An unexpected error occurred during cancellation.", variant: "destructive"});
    } finally {
      setCancellingId(null);
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     return (
      <div className="text-center py-10">
        <AlertCircle size={48} className="mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-headline mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Please log in to view your bookings.</p>
        <Link href="/login">
          <Button variant="default">Login</Button>
        </Link>
      </div>
    );
  }
  
  if (error) {
    return (
       <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Bookings</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline text-primary">My Bookings</h1>
        <p className="text-lg text-muted-foreground font-body">
          View and manage your movie ticket reservations.
        </p>
      </header>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCancelBooking={handleCancelBooking}
              isCancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          <Ticket size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline mb-2">No Bookings Yet!</h2>
          <p className="text-muted-foreground mb-6">You haven't booked any tickets. Explore our movies and make your first booking!</p>
          <Link href="/movies">
            <Button variant="default" size="lg" className="bg-accent hover:bg-accent/90">
              Browse Movies
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
