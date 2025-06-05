"use client";
import { useEffect, useState } from 'react';
import type { Booking } from '@/lib/types';
import { getAllBookings, formatDateTime } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Loader2, Ticket, AlertCircle, UserCircle, FilmIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function AdminAllBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      async function fetchBookings() {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getAllBookings();
          data.sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime());
          setBookings(data);
        } catch (err) {
          console.error("Failed to fetch all bookings:", err);
          setError("Could not load bookings. Please try again later.");
          toast({ title: "Error", description: "Failed to load all bookings.", variant: "destructive"});
        } finally {
          setIsLoading(false);
        }
      }
      fetchBookings();
    }
  }, [user, toast]);
  
  if (authLoading || isLoading || !user || user.role !== 'admin') {
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
        <AlertTitle>Error Loading Bookings</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Ticket size={30} className="mr-3 text-accent" /> All User Bookings
          </CardTitle>
          <CardDescription>
            Overview of all tickets reserved by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Movie</TableHead>
                    <TableHead>Theatre</TableHead>
                    <TableHead>Showtime</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Booked On</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium flex items-center gap-2"><UserCircle size={16}/>{booking.userId}</TableCell>
                      <TableCell className="flex items-center gap-2"><FilmIcon size={16}/>{booking.movieTitle}</TableCell>
                      <TableCell>{booking.theatreName}</TableCell>
                      <TableCell>{formatDateTime(booking.showtimeDateTime)}</TableCell>
                      <TableCell>{booking.selectedSeats.join(', ')}</TableCell>
                      <TableCell>{formatDateTime(booking.bookingTime)}</TableCell>
                      <TableCell className="text-right">${booking.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <Ticket size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-headline mb-2">No Bookings Found</h2>
              <p className="text-muted-foreground">There are currently no bookings in the system.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
