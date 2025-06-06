"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import type { Movie, Showtime, Booking } from '@/lib/types';
import { getMovieById, createBooking, formatDate, formatTime, getBookingById, modifyBookingSeats } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import SeatSelector from '@/components/movies/seat-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Ticket, CalendarDays, Clock, MapPin, Users, AlertCircle, ArrowLeft, Edit3 } from 'lucide-react';
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
  const bookingIdToModify = searchParams.get('bookingId');
  const isModifyMode = searchParams.get('modify') === 'true';

  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [effectiveShowtimeForSelector, setEffectiveShowtimeForSelector] = useState<Showtime | null>(null);
  const [originalBooking, setOriginalBooking] = useState<Booking | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSeatCount, setOriginalSeatCount] = useState<number>(0);


  useEffect(() => {
    if (!movieId || !showtimeId) {
      setError("Movie or showtime information is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const movieData = await getMovieById(movieId);
        if (!movieData) {
          setError("Movie not found.");
          setIsLoading(false);
          return;
        }
        setMovie(movieData);

        const showtimeData = movieData.showtimes.find(st => st.id === showtimeId);
        if (!showtimeData) {
          setError("Showtime not found for this movie.");
          setIsLoading(false);
          return;
        }
        setSelectedShowtime(showtimeData);

        if (isModifyMode && bookingIdToModify && user) {
          const bookingData = await getBookingById(bookingIdToModify);
          if (bookingData && bookingData.userId === user.id && bookingData.showtimeId === showtimeData.id) {
            setOriginalBooking(bookingData);
            setSelectedSeats(bookingData.selectedSeats);
            setOriginalSeatCount(bookingData.selectedSeats.length);
            // Adjust showtime for SeatSelector: make user's old seats appear available during selection process.
            // The actual availableSeats count in the datastore isn't changed by this UI adjustment.
            const adjustedShowtime = {
              ...showtimeData,
              // This makes the user's current seats part of the "available" pool for the selector UI
              // availableSeats: showtimeData.availableSeats + bookingData.selectedSeats.length,
            };
             // For mock, we pass the true showtimeData. The SeatSelector's own logic should handle
            // rendering selected seats as selectable again.
            setEffectiveShowtimeForSelector(showtimeData);

          } else {
            setError("Invalid booking modification request or booking not found.");
            setEffectiveShowtimeForSelector(showtimeData); // Fallback
          }
        } else {
          setEffectiveShowtimeForSelector(showtimeData);
        }

      } catch (err) {
        console.error("Failed to fetch booking details:", err);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [movieId, showtimeId, bookingIdToModify, isModifyMode, user]);

  const handleSeatSelect = (seatId: string) => {
    const isCurrentlySelected = selectedSeats.includes(seatId);
    let newSelectedSeats;

    if (isCurrentlySelected) {
      newSelectedSeats = selectedSeats.filter(s => s !== seatId);
    } else {
      newSelectedSeats = [...selectedSeats, seatId];
    }
    
    if (isModifyMode && originalSeatCount > 0 && newSelectedSeats.length > originalSeatCount) {
       toast({
        title: "Seat Selection Limit",
        description: `You can only select ${originalSeatCount} seat(s) when modifying. Deselect a seat to choose another.`,
        variant: "destructive",
      });
      return; 
    }
    setSelectedSeats(newSelectedSeats);
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
      if (isModifyMode && originalBooking) {
        if (selectedSeats.length !== originalBooking.selectedSeats.length) {
          toast({
            title: "Seat Count Mismatch",
            description: `Please select exactly ${originalBooking.selectedSeats.length} seat(s). You currently have ${selectedSeats.length}.`,
            variant: "destructive",
          });
          setIsBooking(false);
          return;
        }
        await modifyBookingSeats(originalBooking.id, user.id, selectedSeats);
        toast({
          title: "Seats Updated!",
          description: `Your seat selection for ${movie.title} has been modified.`,
          variant: "default"
        });
      } else {
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
      }
      router.push('/bookings');
    } catch (err: any) {
      console.error("Booking/Modification failed:", err);
      setError(err.message || `Failed to ${isModifyMode ? 'modify seats' : 'create booking'}. Please try again.`);
      toast({ title: `${isModifyMode ? 'Modification' : 'Booking'} Failed`, description: err.message || "An error occurred.", variant: "destructive" });
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
            <Link href={isModifyMode && originalBooking ? `/bookings` : (movieId ? `/movies/${movieId}` : "/movies")}>
              <Button variant="outline"><ArrowLeft size={16} className="mr-2" />Go Back</Button>
            </Link>
          </div>
      </Alert>
    );
  }

  if (!movie || !selectedShowtime || !effectiveShowtimeForSelector) {
    return <p className="text-center text-muted-foreground">Movie or showtime details not available.</p>;
  }

  const totalPrice = selectedSeats.length * 15; // Assuming $15 per ticket

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={isModifyMode && originalBooking ? `/bookings` : `/movies/${movie.id}`} className="mb-6 inline-flex items-center">
        <Button variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Back to {isModifyMode && originalBooking ? 'My Bookings' : 'Movie Details'}
        </Button>
      </Link>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            {isModifyMode ? `Modify Seats for ${movie.title}` : `Book Tickets for ${movie.title}`}
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-md">
            <span className="flex items-center"><MapPin size={16} className="mr-1 text-accent" /> {selectedShowtime.theatreName}</span>
            <span className="flex items-center"><CalendarDays size={16} className="mr-1 text-accent" /> {formatDate(selectedShowtime.dateTime)}</span>
            <span className="flex items-center"><Clock size={16} className="mr-1 text-accent" /> {formatTime(selectedShowtime.dateTime)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SeatSelector 
            showtime={effectiveShowtimeForSelector} 
            selectedSeats={selectedSeats} 
            onSeatSelect={handleSeatSelect}
            // If modifying, maxSeats is fixed to original booking's seat count. Otherwise, default (e.g., 5).
            maxSeats={isModifyMode && originalSeatCount > 0 ? originalSeatCount : 5} 
          />
           {isModifyMode && originalSeatCount > 0 && (
            <Alert variant="default" className="mt-4">
              <Edit3 className="h-4 w-4" />
              <AlertTitle>Modifying Seats</AlertTitle>
              <AlertDescription>
                You are modifying your existing booking. Please select exactly {originalSeatCount} seat(s).
                Your previous seats were: {originalBooking?.selectedSeats.join(', ')}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t">
          <div className="text-left">
             <p className="text-lg font-semibold">Total Price: <span className="text-accent">${isModifyMode && originalBooking ? originalBooking.totalPrice.toFixed(2) : totalPrice.toFixed(2)}</span></p>
             <p className="text-sm text-muted-foreground">{selectedSeats.length} seat(s) selected</p>
          </div>
          <Button 
            onClick={handleBooking} 
            disabled={isBooking || selectedSeats.length === 0 || (isModifyMode && originalSeatCount > 0 && selectedSeats.length !== originalSeatCount) }
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isBooking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              isModifyMode ? <Edit3 className="mr-2 h-5 w-5" /> : <Ticket className="mr-2 h-5 w-5" />
            )}
            {isBooking ? 'Processing...' : (isModifyMode ? 'Confirm New Seats' : 'Confirm Booking')}
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
