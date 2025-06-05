"use client";
import type { Movie, MovieFormData, Showtime } from '@/lib/types';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, PlusCircle, Trash2, Film } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

const showtimeSchema = z.object({
  dateTime: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date/time" }),
  theatreName: z.string().min(1, "Theatre name is required"),
  totalSeatsInput: z.coerce.number().int().min(1, "Total seats must be at least 1"),
});

const movieFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  genre: z.string().min(1, "Genre(s) required, comma separated").transform(val => val.split(',').map(g => g.trim())),
  duration: z.coerce.number().int().positive("Duration must be a positive number"),
  posterUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  releaseDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid release date" }),
  director: z.string().min(1, "Director is required"),
  cast: z.string().min(1, "Cast required, comma separated").transform(val => val.split(',').map(c => c.trim())),
  rating: z.coerce.number().min(0).max(5, "Rating must be between 0 and 5"),
  showtimes: z.array(showtimeSchema).min(0, "At least one showtime is recommended"),
});

type MovieFormValues = z.infer<typeof movieFormSchema>;

interface MovieFormProps {
  movie?: Movie; // For editing
  onSubmit: (data: MovieFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function MovieForm({ movie, onSubmit, isSubmitting }: MovieFormProps) {
  const defaultValues = movie ? {
    ...movie,
    genre: movie.genre.join(', '),
    cast: movie.cast.join(', '),
    posterUrl: movie.posterUrl || '',
    releaseDate: movie.releaseDate ? format(parseISO(movie.releaseDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    showtimes: movie.showtimes.map(st => ({
      dateTime: st.dateTime ? format(parseISO(st.dateTime), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      theatreName: st.theatreName,
      totalSeatsInput: st.totalSeats,
    })) || [],
  } : {
    title: '',
    description: '',
    genre: '',
    duration: 120,
    posterUrl: '',
    releaseDate: format(new Date(), "yyyy-MM-dd"),
    director: '',
    cast: '',
    rating: 0,
    showtimes: [],
  };
  
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: defaultValues as MovieFormValues, // Cast needed due to transform
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "showtimes",
  });

  const handleFormSubmit = (data: MovieFormValues) => {
    const poster = data.posterUrl || `https://placehold.co/400x600.png?text=${encodeURIComponent(data.title)}`;
    const movieDataSubmit: MovieFormData = {
      ...data,
      posterUrl: poster,
      releaseDate: new Date(data.releaseDate).toISOString(), // ensure ISO string
      showtimes: data.showtimes.map(st => ({
        dateTime: new Date(st.dateTime).toISOString(),
        theatreName: st.theatreName,
        totalSeats: st.totalSeatsInput,
      })),
    };
    onSubmit(movieDataSubmit);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary flex items-center">
          <Film size={30} className="mr-3 text-accent" /> {movie ? 'Edit Movie' : 'Add New Movie'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register('title')} className="mt-1" />
              {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="director">Director</Label>
              <Input id="director" {...form.register('director')} className="mt-1" />
              {form.formState.errors.director && <p className="text-sm text-destructive mt-1">{form.formState.errors.director.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} rows={4} className="mt-1" />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="genre">Genre (comma-separated)</Label>
              <Input id="genre" {...form.register('genre')} className="mt-1" placeholder="e.g. Action, Sci-Fi" />
              {form.formState.errors.genre && <p className="text-sm text-destructive mt-1">{form.formState.errors.genre.message}</p>}
            </div>
            <div>
              <Label htmlFor="cast">Cast (comma-separated)</Label>
              <Input id="cast" {...form.register('cast')} className="mt-1" placeholder="e.g. Actor One, Actor Two" />
              {form.formState.errors.cast && <p className="text-sm text-destructive mt-1">{form.formState.errors.cast.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" {...form.register('duration')} className="mt-1" />
              {form.formState.errors.duration && <p className="text-sm text-destructive mt-1">{form.formState.errors.duration.message}</p>}
            </div>
            <div>
              <Label htmlFor="releaseDate">Release Date</Label>
               <Controller
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.releaseDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.releaseDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input id="rating" type="number" step="0.1" {...form.register('rating')} className="mt-1" />
              {form.formState.errors.rating && <p className="text-sm text-destructive mt-1">{form.formState.errors.rating.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="posterUrl">Poster URL (optional)</Label>
            <Input id="posterUrl" {...form.register('posterUrl')} className="mt-1" placeholder="https://example.com/poster.jpg"/>
            {form.formState.errors.posterUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.posterUrl.message}</p>}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-headline text-accent">Showtimes</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-3 relative bg-card/50">
                 <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                    aria-label="Remove showtime"
                  >
                    <Trash2 size={18} />
                  </Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`showtimes.${index}.dateTime`}>Date & Time</Label>
                    <Input
                      id={`showtimes.${index}.dateTime`}
                      type="datetime-local"
                      {...form.register(`showtimes.${index}.dateTime`)}
                      className="mt-1"
                    />
                    {form.formState.errors.showtimes?.[index]?.dateTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.showtimes[index]?.dateTime?.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`showtimes.${index}.theatreName`}>Theatre Name</Label>
                    <Input
                      id={`showtimes.${index}.theatreName`}
                      {...form.register(`showtimes.${index}.theatreName`)}
                      className="mt-1"
                    />
                    {form.formState.errors.showtimes?.[index]?.theatreName && <p className="text-sm text-destructive mt-1">{form.formState.errors.showtimes[index]?.theatreName?.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`showtimes.${index}.totalSeatsInput`}>Total Seats</Label>
                    <Input
                      id={`showtimes.${index}.totalSeatsInput`}
                      type="number"
                      {...form.register(`showtimes.${index}.totalSeatsInput`)}
                      className="mt-1"
                    />
                    {form.formState.errors.showtimes?.[index]?.totalSeatsInput && <p className="text-sm text-destructive mt-1">{form.formState.errors.showtimes[index]?.totalSeatsInput?.message}</p>}
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"), theatreName: '', totalSeatsInput: 100 })}
              className="flex items-center"
            >
              <PlusCircle size={18} className="mr-2" /> Add Showtime
            </Button>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? (movie ? 'Updating...' : 'Adding...') : (movie ? 'Save Changes' : 'Add Movie')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
