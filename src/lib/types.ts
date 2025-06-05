
export interface Seat {
  id: string;
  isOccupied: boolean;
  isSelected?: boolean;
}

export interface Showtime {
  id: string;
  dateTime: string; // ISO string
  theatreName: string;
  availableSeats: number; // Simple count for now
  totalSeats: number;
  // For more complex seat selection:
  // seatLayout?: Seat[][]; 
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
  theatreName: string;
  selectedSeats: string[]; // e.g., ["A1", "A2"]
  bookingTime: string; // ISO string
  totalPrice: number;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  // password field should not be stored or passed around in frontend models
}

// For forms
export type MovieFormData = Omit<Movie, 'id' | 'showtimes'> & {
  showtimes: Array<Omit<Showtime, 'id' | 'availableSeats' | 'totalSeats'> & { totalSeatsInput?: number }>;
};
