import type { Movie, Showtime, Booking, User } from './types';
import { format } from 'date-fns';

let moviesStore: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    description: 'A thief who steals information by entering people\'s dreams...',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    duration: 148,
    posterUrl: 'https://placehold.co/400x600.png?text=Inception',
    releaseDate: '2010-07-16T00:00:00Z',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    rating: 4.8,
    showtimes: [
      { id: 'st1-1', dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), theatreName: 'Cineplex Odeon', availableSeats: 50, totalSeats: 100 },
      { id: 'st1-2', dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), theatreName: 'Grand Cinema Hall', availableSeats: 30, totalSeats: 80 },
    ],
  },
  {
    id: '2',
    title: 'The Matrix',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality...',
    genre: ['Sci-Fi', 'Action'],
    duration: 136,
    posterUrl: 'https://placehold.co/400x600.png?text=The+Matrix',
    releaseDate: '1999-03-31T00:00:00Z',
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    rating: 4.7,
    showtimes: [
      { id: 'st2-1', dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), theatreName: 'Cineplex Odeon', availableSeats: 60, totalSeats: 100 },
    ],
  },
  {
    id: '3',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    duration: 169,
    posterUrl: 'https://placehold.co/400x600.png?text=Interstellar',
    releaseDate: '2014-11-07T00:00:00Z',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    rating: 4.9,
    showtimes: [
      { id: 'st3-1', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), theatreName: 'IMAX Experience', availableSeats: 100, totalSeats: 150 },
    ],
  }
];

let bookingsStore: Booking[] = [];

let usersStore: User[] = [
  { id: 'user1', username: 'testuser', role: 'user' },
  { id: 'admin1', username: 'admin', role: 'admin' },
];

// Movie Management
export const getMovies = async (): Promise<Movie[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(moviesStore)); // Deep copy to prevent direct state mutation
};

export const getMovieById = async (id: string): Promise<Movie | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(moviesStore.find(movie => movie.id === id)));
};

export const addMovie = async (movieData: Omit<Movie, 'id'>): Promise<Movie> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newMovie: Movie = { 
    ...movieData, 
    id: String(Date.now() + Math.random()),
    showtimes: movieData.showtimes.map((st, index) => ({
      ...st,
      id: `st-${movieData.id || Date.now()}-${index}`, // ensure unique showtime id
      availableSeats: st.totalSeats, // initially all seats available
    }))
  };
  moviesStore.push(newMovie);
  return JSON.parse(JSON.stringify(newMovie));
};

export const updateMovie = async (id: string, movieData: Partial<Omit<Movie, 'id'>>): Promise<Movie | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const movieIndex = moviesStore.findIndex(movie => movie.id === id);
  if (movieIndex === -1) return undefined;
  moviesStore[movieIndex] = { ...moviesStore[movieIndex], ...movieData };
  // If showtimes are part of movieData, ensure they get new IDs if they don't have one or are new
  if (movieData.showtimes) {
    moviesStore[movieIndex].showtimes = movieData.showtimes.map((st, index) => ({
      ...st,
      id: st.id || `st-${id}-${index}-${Date.now()}`,
      availableSeats: st.availableSeats !== undefined ? st.availableSeats : st.totalSeats,
    }));
  }
  return JSON.parse(JSON.stringify(moviesStore[movieIndex]));
};

export const deleteMovie = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const initialLength = moviesStore.length;
  moviesStore = moviesStore.filter(movie => movie.id !== id);
  return moviesStore.length < initialLength;
};


// Booking Management
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingTime' | 'totalPrice'>): Promise<Booking> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const movie = await getMovieById(bookingData.movieId);
  if (!movie) throw new Error('Movie not found');
  const showtime = movie.showtimes.find(st => st.id === bookingData.showtimeId);
  if (!showtime) throw new Error('Showtime not found');

  if (showtime.availableSeats < bookingData.selectedSeats.length) {
    throw new Error('Not enough seats available');
  }
  
  // In a real app, this would be a transactional update.
  // For mock, directly update the moviesStore.
  const movieIndex = moviesStore.findIndex(m => m.id === movie.id);
  if (movieIndex !== -1) {
    const showtimeIndex = moviesStore[movieIndex].showtimes.findIndex(st => st.id === showtime.id);
    if (showtimeIndex !== -1) {
      moviesStore[movieIndex].showtimes[showtimeIndex].availableSeats -= bookingData.selectedSeats.length;
    }
  }


  const newBooking: Booking = {
    ...bookingData,
    id: String(Date.now() + Math.random()),
    bookingTime: new Date().toISOString(),
    totalPrice: bookingData.selectedSeats.length * 15, // Assume $15 per ticket
  };
  bookingsStore.push(newBooking);
  return JSON.parse(JSON.stringify(newBooking));
};

export const getBookingById = async (bookingId: string): Promise<Booking | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(bookingsStore.find(b => b.id === bookingId)));
};

export const modifyBookingSeats = async (bookingId: string, userId: string, newSeats: string[]): Promise<Booking | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const bookingIndex = bookingsStore.findIndex(b => b.id === bookingId && b.userId === userId);
  if (bookingIndex === -1) {
    throw new Error("Booking not found or user mismatch.");
  }

  const originalBooking = bookingsStore[bookingIndex];
  if (newSeats.length !== originalBooking.selectedSeats.length) {
    throw new Error("The number of seats must remain the same when modifying.");
  }

  // In a real system, you'd also verify that the newSeats are available for the showtime
  // and atomically update showtime seat availability. For this mock, we assume the
  // SeatSelector component has already validated this based on current availability
  // (excluding the user's original seats). The availableSeats count in moviesStore
  // does not change as the number of tickets held by the user is constant.

  bookingsStore[bookingIndex].selectedSeats = newSeats;
  bookingsStore[bookingIndex].bookingTime = new Date().toISOString(); // Update booking time to reflect modification

  return JSON.parse(JSON.stringify(bookingsStore[bookingIndex]));
};


export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(bookingsStore.filter(booking => booking.userId === userId)));
};

export const getAllBookings = async (): Promise<Booking[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(JSON.stringify(bookingsStore));
}

export const cancelBooking = async (bookingId: string, userId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const bookingIndex = bookingsStore.findIndex(b => b.id === bookingId && b.userId === userId);
  if (bookingIndex === -1) return false;

  const booking = bookingsStore[bookingIndex];
  
  // Restore seats to moviesStore
  const movieIndex = moviesStore.findIndex(m => m.id === booking.movieId);
  if (movieIndex !== -1) {
    const showtimeIndex = moviesStore[movieIndex].showtimes.findIndex(st => st.id === booking.showtimeId);
    if (showtimeIndex !== -1) {
      moviesStore[movieIndex].showtimes[showtimeIndex].availableSeats += booking.selectedSeats.length;
      // Ensure availableSeats does not exceed totalSeats
      if (moviesStore[movieIndex].showtimes[showtimeIndex].availableSeats > moviesStore[movieIndex].showtimes[showtimeIndex].totalSeats) {
        moviesStore[movieIndex].showtimes[showtimeIndex].availableSeats = moviesStore[movieIndex].showtimes[showtimeIndex].totalSeats;
      }
    }
  }

  bookingsStore.splice(bookingIndex, 1);
  return true;
};


// User Management (Simplified)
export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(usersStore.find(user => user.username === username)));
};

// Helper to format date for display
export const formatDate = (dateString: string, formatString: string = 'MMMM d, yyyy') => {
  return format(new Date(dateString), formatString);
};

export const formatTime = (dateString: string) => {
  return format(new Date(dateString), 'h:mm a');
};

export const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
}
