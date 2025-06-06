
export interface Seat {
  id: string;
  isOccupied: boolean;
  isSelected?: boolean;
}

export interface Theatre {
  id: string;
  name: string;
  location?: string; // Optional field for more details
}

export interface Showtime {
  id: string;
  dateTime: string; // ISO string
  theatreId: string; // Changed from theatreName
  theatreName?: string; // For display purposes, populated from Theatre store
  availableSeats: number; 
  totalSeats: number;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number; // in minutes
  posterUrl: string;
  releaseDate: string; // ISO string
  director: string;
  cast: string[];
  rating: number; // e.g., 4.5
  showtimes: Showtime[];
}

export interface Booking {
  id:string;
  userId: string;
  movieId: string;
  movieTitle: string;
  showtimeId: string;
  showtimeDateTime: string; // ISO string
  theatreId: string;
  theatreName: string; // This will be populated from the Theatre store via showtime
  selectedSeats: string[]; // e.g., ["A1", "A2"]
  bookingTime: string; // ISO string
  totalPrice: number;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

// For forms
export type MovieFormData = Omit<Movie, 'id' | 'showtimes' | 'posterUrl'> & {
  posterUrl?: string; // Make optional as it can be auto-generated
  showtimes: Array<Omit<Showtime, 'id' | 'availableSeats' | 'totalSeats' | 'theatreName'> & { 
    totalSeatsInput?: number; // Used in form
  }>;
};

export type TheatreFormData = Omit<Theatre, 'id'>;
