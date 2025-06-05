"use client";
import type { Seat, Showtime } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Armchair } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatSelectorProps {
  showtime: Showtime;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats?: number; // Max seats a user can select
}

// Generate a mock seat layout
const generateMockSeats = (rows: number, cols: number, totalSeats: number, availableSeats: number): Seat[][] => {
  const seats: Seat[][] = [];
  let seatCount = 0;
  const occupiedCount = totalSeats - availableSeats;
  let occupiedPlaced = 0;

  // Create a flat array of seat IDs to randomly mark as occupied
  const flatSeats: {id: string, row: number, col: number}[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (seatCount < totalSeats) {
        flatSeats.push({id: `${String.fromCharCode(65 + i)}${j + 1}`, row: i, col: j});
        seatCount++;
      }
    }
  }
  
  // Shuffle and mark seats as occupied
  const shuffledSeats = [...flatSeats].sort(() => 0.5 - Math.random());
  const occupiedSeatIds = new Set<string>();
  for(let i=0; i<occupiedCount && i < shuffledSeats.length; i++) {
    occupiedSeatIds.add(shuffledSeats[i].id);
  }
  
  seatCount = 0;
  for (let i = 0; i < rows; i++) {
    const row: Seat[] = [];
    for (let j = 0; j < cols; j++) {
      if (seatCount < totalSeats) {
        const seatId = `${String.fromCharCode(65 + i)}${j + 1}`;
        row.push({
          id: seatId,
          isOccupied: occupiedSeatIds.has(seatId),
        });
        seatCount++;
      } else {
        // Add spacer for non-existent seats if layout is larger than totalSeats
         row.push({ id: `spacer-${i}-${j}`, isOccupied: true }); // Treat as unusable
      }
    }
    seats.push(row);
  }
  return seats;
};


export default function SeatSelector({ showtime, selectedSeats, onSeatSelect, maxSeats = 5 }: SeatSelectorProps) {
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]);

  useEffect(() => {
    // Determine rows/cols based on totalSeats, e.g. 10 seats per row
    const cols = 10;
    const rows = Math.ceil(showtime.totalSeats / cols);
    setSeatLayout(generateMockSeats(rows, cols, showtime.totalSeats, showtime.availableSeats));
  }, [showtime]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.id.startsWith('spacer-')) return; // Ignore spacers
    if (seat.isOccupied) return;
    
    const isSelected = selectedSeats.includes(seat.id);
    if (!isSelected && selectedSeats.length >= maxSeats) {
      // Optionally show a toast notification here
      alert(`You can select a maximum of ${maxSeats} seats.`);
      return;
    }
    onSeatSelect(seat.id);
  };

  if (!seatLayout.length) return <p>Loading seat layout...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 text-center font-headline">Select Your Seats (Max {maxSeats})</h3>
        <div className="p-4 bg-card rounded-lg shadow">
          <div className="mb-4 py-2 px-4 bg-muted text-muted-foreground text-center rounded">Screen This Way</div>
          <div className="flex flex-col items-center space-y-2 overflow-x-auto pb-4">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex space-x-1.5">
                {row.map((seat) => {
                  if (seat.id.startsWith('spacer-')) {
                     return <div key={seat.id} className="w-8 h-8 md:w-10 md:h-10" />; // Spacer
                  }
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <Button
                      key={seat.id}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 transition-all duration-150",
                        seat.isOccupied && "bg-muted text-muted-foreground/50 cursor-not-allowed opacity-60",
                        isSelected && "bg-accent text-accent-foreground border-accent ring-2 ring-accent ring-offset-2 ring-offset-background",
                        !seat.isOccupied && !isSelected && "hover:bg-primary/20"
                      )}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isOccupied}
                      aria-label={`Seat ${seat.id}${seat.isOccupied ? ' (Occupied)' : isSelected ? ' (Selected)' : ' (Available)'}`}
                    >
                      <Armchair size={18} />
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-around items-center text-sm p-2 bg-muted rounded-md">
        <div className="flex items-center gap-2"><Armchair className="text-foreground" /> Available</div>
        <div className="flex items-center gap-2"><Armchair className="text-accent" /> Selected</div>
        <div className="flex items-center gap-2"><Armchair className="text-muted-foreground/50 opacity-60" /> Occupied</div>
      </div>
      {selectedSeats.length > 0 && (
        <div className="text-center p-3 bg-primary/10 rounded-md">
          <p className="font-semibold">Selected Seats: {selectedSeats.join(', ')}</p>
          <p className="text-sm">Total: {selectedSeats.length} seat(s)</p>
        </div>
      )}
    </div>
  );
}
