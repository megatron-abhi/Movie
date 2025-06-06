
import type { Movie, Showtime, Booking, User, Theatre, TheatreFormData } from './types';
import { format } from 'date-fns';

let theatresStore: Theatre[] = [
  { id: 'th1', name: 'Cineplex Odeon Downtown', location: '123 Main St' },
  { id: 'th2', name: 'Grand Cinema Hall Complex', location: '456 Film Ave' },
  { id: 'th3', name: 'IMAX Experience Centre', location: '789 Projection Blvd' },
];

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
      { id: 'st1-1', dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), theatreId: 'th1', availableSeats: 50, totalSeats: 100 },
      { id: 'st1-2', dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), theatreId: 'th2', availableSeats: 30, totalSeats: 80 },
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
      { id: 'st2-1', dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), theatreId: 'th1', availableSeats: 60, totalSeats: 100 },
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
      { id: 'st3-1', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), theatreId: 'th3', availableSeats: 100, totalSeats: 150 },
    ],
  }
];

let bookingsStore: Booking[] = [];

let usersStore: User[] = [
  { id: 'user1', username: 'testuser', role: 'user' },
  { id: 'admin1', username: 'admin', role: 'admin' },
];

// Theatre Management
export const getTheatres = async (): Promise<Theatre[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(theatresStore));
};

export const getTheatreById = async (id: string): Promise<Theatre | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(theatresStore.find(t => t.id === id)));
}

export const addTheatre = async (theatreData: TheatreFormData): Promise<Theatre> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newTheatre: Theatre = {
    ...theatreData,
    id: String(Date.now() + Math.random()),
  };
  theatresStore.push(newTheatre);
  return JSON.parse(JSON.stringify(newTheatre));
};

export const deleteTheatre = async (id: string): Promise<{ success: boolean, message?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  // Check if any movie showtime uses this theatre
  const isTheatreInUse = moviesStore.some(movie => 
    movie.showtimes.some(showtime => showtime.theatreId === id)
  );

  if (isTheatreInUse) {
    return { success: false, message: "Cannot delete theatre. It is currently assigned to one or more movie showtimes." };
  }

  const initialLength = theatresStore.length;
  theatresStore = theatresStore.filter(theatre => theatre.id !== id);
  return { success: theatresStore.length < initialLength };
};


// Movie Management
const populateShowtimeTheatreNames = (showtimes: Showtime[]): Showtime[] => {
  return showtimes.map(st => {
    const theatre = theatresStore.find(t => t.id === st.theatreId);
    return {
      ...st,
      theatreName: theatre ? theatre.name : 'Unknown Theatre',
    };
  });
};

export const getMovies = async (): Promise<Movie[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const moviesWithPopulatedShowtimes = moviesStore.map(movie => ({
    ...movie,
    showtimes: populateShowtimeTheatreNames(movie.showtimes),
  }));
  return JSON.parse(JSON.stringify(moviesWithPopulatedShowtimes));
};

export const getMovieById = async (id: string): Promise<Movie | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const movie = moviesStore.find(movie => movie.id === id);
  if (!movie) return undefined;
  const movieWithPopulatedShowtimes = {
    ...movie,
    showtimes: populateShowtimeTheatreNames(movie.showtimes),
  };
  return JSON.parse(JSON.stringify(movieWithPopulatedShowtimes));
};

export const addMovie = async (movieData: Omit<Movie, 'id' | 'posterUrl'> & { posterUrl?: string }): Promise<Movie> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newMovie: Movie = { 
    ...movieData, 
    id: String(Date.now() + Math.random()),
    posterUrl: movieData.posterUrl || `https://placehold.co/400x600.png?text=${encodeURIComponent(movieData.title)}`,
    showtimes: movieData.showtimes.map((st, index) => ({
      ...st,
      id: `st-${movieData.id || Date.now()}-${index}`, 
      availableSeats: st.totalSeats, 
    }))
  };
  moviesStore.push(newMovie);
  return JSON.parse(JSON.stringify(newMovie));
};

export const updateMovie = async (id: string, movieData: Partial<Omit<Movie, 'id'>>): Promise<Movie | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const movieIndex = moviesStore.findIndex(movie => movie.id === id);
  if (movieIndex === -1) return undefined;
  
  moviesStore[movieIndex] = { 
    ...moviesStore[movieIndex], 
    ...movieData,
    posterUrl: movieData.posterUrl || moviesStore[movieIndex].posterUrl || `https://placehold.co/400x600.png?text=${encodeURIComponent(moviesStore[movieIndex].title)}`,
   };

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
  // Also remove associated bookings for deleted movies if desired, or handle as "movie not found"
  // bookingsStore = bookingsStore.filter(booking => booking.movieId !== id);
  return moviesStore.length < initialLength;
};


// Booking Management
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'bookingTime' | 'totalPrice' | 'theatreName'>): Promise<Booking> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Use movieTitle from bookingData if provided, otherwise fetch
  let finalMovieTitle = bookingData.movieTitle;
  if (!finalMovieTitle && bookingData.movieId) {
    const movie = await getMovieById(bookingData.movieId);
    if (!movie || !movie.title) throw new Error('Movie or movie title not found');
    finalMovieTitle = movie.title;
  } else if (!finalMovieTitle) {
     throw new Error('Movie title is missing in booking data and cannot be fetched.');
  }

  const movieForShowtimeCheck = await getMovieById(bookingData.movieId);
  if (!movieForShowtimeCheck) throw new Error('Movie not found for showtime validation');
  
  const showtime = movieForShowtimeCheck.showtimes.find(st => st.id === bookingData.showtimeId);
  if (!showtime) throw new Error('Showtime not found');

  if (!bookingData.theatreId) {
    throw new Error("Theatre ID is missing in booking data.");
  }
  const theatre = await getTheatreById(bookingData.theatreId);
  if (!theatre || !theatre.name) throw new Error('Theatre or theatre name not found for booking.');

  if (showtime.availableSeats < bookingData.selectedSeats.length) {
    throw new Error('Not enough seats available');
  }
  
  const movieIndexOriginal = moviesStore.findIndex(m => m.id === bookingData.movieId);
  if (movieIndexOriginal !== -1) {
    const showtimeIndexOriginal = moviesStore[movieIndexOriginal].showtimes.findIndex(st => st.id === bookingData.showtimeId);
    if (showtimeIndexOriginal !== -1) {
      moviesStore[movieIndexOriginal].showtimes[showtimeIndexOriginal].availableSeats -= bookingData.selectedSeats.length;
    }
  }

  const newBooking: Booking = {
    // Spread bookingData first, so finalMovieTitle and theatre.name can overwrite if necessary
    // or ensure bookingData doesn't have these if they are always derived here.
    // For this case, bookingData already includes movieTitle.
    ...bookingData, 
    id: String(Date.now() + Math.random()),
    movieTitle: finalMovieTitle, // Ensure we use the determined movie title
    bookingTime: new Date().toISOString(),
    totalPrice: bookingData.selectedSeats.length * 15, 
    theatreName: theatre.name, // Stored at booking time from the fetched theatre
  };
  bookingsStore.push(newBooking);
  return JSON.parse(JSON.stringify(newBooking));
};

export const getBookingById = async (bookingId: string): Promise<Booking | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const booking = bookingsStore.find(b => b.id === bookingId);
  if (!booking) return undefined;
  
  const bCopy = { ...booking };
  // Fallback for older data potentially missing theatreName
  if ((!bCopy.theatreName || bCopy.theatreName.trim() === '') && bCopy.theatreId) {
      const theatre = await getTheatreById(bCopy.theatreId);
      bCopy.theatreName = theatre ? theatre.name : "N/A";
  } else if (!bCopy.theatreName) {
      bCopy.theatreName = "N/A";
  }
   // Fallback for older data potentially missing movieTitle
  if ((!bCopy.movieTitle || bCopy.movieTitle.trim() === '') && bCopy.movieId) {
      const movie = await getMovieById(bCopy.movieId);
      bCopy.movieTitle = movie ? movie.title : "N/A";
  } else if (!bCopy.movieTitle) {
      bCopy.movieTitle = "N/A";
  }
  return JSON.parse(JSON.stringify(bCopy));
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

  // No change to available seats in theatre as total # of seats booked remains same.
  // Just update selected seats and booking time.
  bookingsStore[bookingIndex].selectedSeats = newSeats;
  bookingsStore[bookingIndex].bookingTime = new Date().toISOString(); 

  return JSON.parse(JSON.stringify(bookingsStore[bookingIndex]));
};


export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const userBookings = bookingsStore.filter(booking => booking.userId === userId);
  
  const populatedUserBookings = await Promise.all(userBookings.map(async booking => {
    const b = { ...booking };
    if ((!b.theatreName || b.theatreName.trim() === '') && b.theatreId) {
      const theatre = await getTheatreById(b.theatreId);
      b.theatreName = theatre ? theatre.name : "N/A";
    } else if (!b.theatreName) {
      b.theatreName = "N/A";
    }
    if ((!b.movieTitle || b.movieTitle.trim() === '') && b.movieId) {
        const movie = await getMovieById(b.movieId);
        b.movieTitle = movie ? movie.title : "N/A";
    } else if (!b.movieTitle) {
        b.movieTitle = "N/A";
    }
    return b;
  }));
  return JSON.parse(JSON.stringify(populatedUserBookings));
};

export const getAllBookings = async (): Promise<Booking[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  // Prioritize already stored movieTitle and theatreName on the booking.
  // Fallback to fetching only if they are missing, to ensure data from time of booking is kept.
  const processedBookings = await Promise.all(bookingsStore.map(async (booking) => {
    const b = { ...booking }; // Work with a copy

    // If theatreName is effectively missing, and theatreId exists, try to populate it.
    if ((!b.theatreName || b.theatreName.trim() === '') && b.theatreId) {
      const theatre = await getTheatreById(b.theatreId);
      b.theatreName = theatre?.name || 'N/A (Theatre Lookup Failed)';
    } else if (!b.theatreName || b.theatreName.trim() === '') {
      // If theatreName is missing and no theatreId to look up
      b.theatreName = 'N/A (No Theatre Info)';
    }

    // If movieTitle is effectively missing, and movieId exists, try to populate it.
    if ((!b.movieTitle || b.movieTitle.trim() === '') && b.movieId) {
        const movie = await getMovieById(b.movieId);
        b.movieTitle = movie?.title || 'N/A (Movie Lookup Failed)';
    } else if (!b.movieTitle || b.movieTitle.trim() === '') {
      // If movieTitle is missing and no movieId to look up
        b.movieTitle = 'N/A (No Movie Info)';
    }
    return b;
  }));
  return JSON.parse(JSON.stringify(processedBookings));
}

export const cancelBooking = async (bookingId: string, userId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const bookingIndex = bookingsStore.findIndex(b => b.id === bookingId && b.userId === userId);
  if (bookingIndex === -1) return false;

  const booking = bookingsStore[bookingIndex];
  
  const movieIndexOriginal = moviesStore.findIndex(m => m.id === booking.movieId);
  if (movieIndexOriginal !== -1) {
    const showtimeIndexOriginal = moviesStore[movieIndexOriginal].showtimes.findIndex(st => st.id === booking.showtimeId);
    if (showtimeIndexOriginal !== -1) {
      moviesStore[movieIndexOriginal].showtimes[showtimeIndexOriginal].availableSeats += booking.selectedSeats.length;
      if (moviesStore[movieIndexOriginal].showtimes[showtimeIndexOriginal].availableSeats > moviesStore[movieIndexOriginal].showtimes[showtimeIndexOriginal].totalSeats) {
        moviesStore[movieIndexOriginal].showtimes[showtimeIndexOriginal].availableSeats = moviesStore[movieIndexOriginal].showtimes[showtimeIndexOriginal].totalSeats;
      }
    }
  }

  bookingsStore.splice(bookingIndex, 1);
  return true;
};

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(usersStore.find(user => user.username === username)));
};

export const formatDate = (dateString: string, formatString: string = 'MMMM d, yyyy') => {
  try {
    return format(new Date(dateString), formatString);
  } catch (e) {
    return "Invalid Date";
  }
};

export const formatTime = (dateString: string) => {
   try {
    return format(new Date(dateString), 'h:mm a');
  } catch (e) {
    return "Invalid Time";
  }
};

export const formatDateTime = (dateString: string) => {
   try {
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
  } catch (e) {
    return "Invalid Date/Time";
  }
}

