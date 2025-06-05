"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import type { Movie, Showtime, Booking } from '@/lib/types';
import { getMovieById, createBooking, formatDate, formatTime } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import SeatSelector from '@/components/movies/seat-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Ticket, CalendarDays, Clock, MapPin, Users, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

function BookingPageContents() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const movieId = params.id as string;
  const showtimeId = searchParams.get('showtimeId');

  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId || !showtimeId) {
      setError("Movie or showtime information is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const movieData = await getMovieById(movieId);
        if (!movieData) {
          setError("Movie not found.");
          return;
        }
        setMovie(movieData);
        const showtimeData = movieData.showtimes.find(st => st.id === showtimeId);
        if (!showtimeData) {
          setError("Showtime not found for this movie.");
          return;
        }
        setSelectedShowtime(showtimeData);
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [movieId, showtimeId]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to book tickets.", variant: "destructive" });
      router.push('/login');
      return;
    }
    if (!movie || !selectedShowtime || selectedSeats.length === 0) {
      toast({ title: "Booking Error", description: "Please select seats before booking.", variant: "destructive" });
      return;
    }

    setIsBooking(true);
    setError(null);
    try {
      const bookingData: Omit<Booking, 'id' | 'bookingTime' | 'totalPrice'> = {
        userId: user.id,
        movieId: movie.id,
        movieTitle: movie.title,
        showtimeId: selectedShowtime.id,
        showtimeDateTime: selectedShowtime.dateTime,
        theatreName: selectedShowtime.theatreName,
        selectedSeats,
      };
      await createBooking(bookingData);
      toast({
        title: "Booking Successful!",
        description: `Your tickets for ${movie.title} are confirmed.`,
        variant: "default"
      });
      router.push('/bookings');
    } catch (err: any) {
      console.error("Booking failed:", err);
      setError(err.message || "Failed to create booking. Please try again.");
      toast({ title: "Booking Failed", description: err.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
         <div className="mt-4">
            <Link href={movieId ? `/movies/${movieId}` : "/movies"}>
              <Button variant="outline"><ArrowLeft size={16} className="mr-2" />Go Back</Button>
            </Link>
          </div>
      </Alert>
    );
  }

  if (!movie || !selectedShowtime) {
    return <p className="text-center text-muted-foreground">Movie or showtime details not available.</p>;
  }

  const totalPrice = selectedSeats.length * 15; // Assuming $15 per ticket

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/movies/${movie.id}`} className="mb-6 inline-flex items-center">
        <Button variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Back to Movie Details
        </Button>
      </Link>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Book Tickets for {movie.title}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-md">
            <span className="flex items-center"><MapPin size={16} className="mr-1 text-accent" /> {selectedShowtime.theatreName}</span>
            <span className="flex items-center"><CalendarDays size={16} className="mr-1 text-accent" /> {formatDate(selectedShowtime.dateTime)}</span>
            <span className="flex items-center"><Clock size={16} className="mr-1 text-accent" /> {formatTime(selectedShowtime.dateTime)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SeatSelector 
            showtime={selectedShowtime} 
            selectedSeats={selectedSeats} 
            onSeatSelect={handleSeatSelect} 
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t">
          <div className="text-left">
             <p className="text-lg font-semibold">Total Price: <span className="text-accent">${totalPrice.toFixed(2)}</span></p>
             <p className="text-sm text-muted-foreground">{selectedSeats.length} seat(s) selected</p>
          </div>
          <Button 
            onClick={handleBooking} 
            disabled={isBooking || selectedSeats.length === 0}
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isBooking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ticket className="mr-2 h-5 w-5" />
            )}
            {isBooking ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <BookingPageContents />
    </Suspense>
  );
}
