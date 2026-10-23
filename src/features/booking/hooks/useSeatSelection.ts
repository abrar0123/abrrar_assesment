import { useCallback, useEffect, useMemo, useState } from 'react';
import { Hall, Seat, buildSeatMap } from '../data/cinema';
import { bookedSeatIds } from '../storage/bookingStorage';
import { MAX_SEATS_PER_BOOKING, markBooked, sortSeats, totalPrice } from '../utils/seats';

interface Options {
  movieId: string;
  date: string;
  hall: Hall;
  onLimitReached?: (max: number) => void;
}

// Seat map for one show plus the user's current selection and running total.
export function useSeatSelection({ movieId, date, hall, onLimitReached }: Options) {
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    bookedSeatIds(movieId, date, hall.id).then((ids) => active && setBooked(ids));
    return () => {
      active = false;
    };
  }, [movieId, date, hall.id]);

  const rows = useMemo(
    () => markBooked(buildSeatMap(`${movieId}-${date}-${hall.id}`), booked),
    [movieId, date, hall.id, booked],
  );

  const seatsById = useMemo(
    () => new Map(rows.flatMap((r) => r.blocks.flat()).map((s) => [s.id, s])),
    [rows],
  );

  const toggle = useCallback(
    (seat: Seat) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(seat.id)) {
          next.delete(seat.id);
        } else if (next.size >= MAX_SEATS_PER_BOOKING) {
          onLimitReached?.(MAX_SEATS_PER_BOOKING);
          return prev;
        } else {
          next.add(seat.id);
        }
        return next;
      });
    },
    [onLimitReached],
  );

  const selectedSeats = useMemo(
    () => sortSeats([...selected].map((id) => seatsById.get(id)).filter((s): s is Seat => !!s)),
    [selected, seatsById],
  );

  return {
    rows,
    selected,
    selectedSeats,
    total: totalPrice(selectedSeats, hall),
    toggle,
  };
}
