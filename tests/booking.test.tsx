import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import SeatsScreen from '@/app/booking/seats';
import { Seat, addBooking, buildSeatMap, getBookings } from '@/src/features/booking';
import { createWrapper } from '@/src/test/render';

const SHOW = { id: '42', title: 'Hope', date: '2026-12-01', hallId: 'h1' }; // Hall 1: $50, VIP $150
const seats = buildSeatMap(`${SHOW.id}-${SHOW.date}-${SHOW.hallId}`).flatMap((r) => r.blocks.flat());
const firstFree = (kind: Seat['kind']) => seats.find((s) => s.available && s.kind === kind)!;
const seatLabel = (s: Seat) => `Row ${s.row} seat ${s.number}${s.kind === 'vip' ? ' VIP' : ''}`;

const renderSeats = async () => {
  renderRouter(
    { 'booking/seats': SeatsScreen, '(tabs)/dashboard': () => null, '(tabs)/watch': () => null },
    { initialUrl: `/booking/seats?${new URLSearchParams(SHOW)}`, wrapper: createWrapper() },
  );
  // The map sizes its seats from its measured width; tests have no layout pass, so provide one.
  fireEvent(await screen.findByTestId('seat-map'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 420 } },
  });
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('Seat selection', () => {
  it('prices regular and VIP seats and lets the user remove a seat again', async () => {
    await renderSeats();
    const regular = firstFree('regular');
    const vip = firstFree('vip');

    fireEvent.press(await screen.findByLabelText(seatLabel(regular)));
    fireEvent.press(screen.getByLabelText(seatLabel(vip)));
    expect(screen.getByText('$ 200')).toBeVisible();

    fireEvent.press(screen.getByLabelText(`Remove row ${vip.row} seat ${vip.number}`));
    expect(screen.getByText('$ 50')).toBeVisible();
  });

  it('saves the booking on device and confirms it', async () => {
    await renderSeats();
    const regular = firstFree('regular');

    fireEvent.press(await screen.findByLabelText(seatLabel(regular)));
    fireEvent.press(screen.getByRole('button', { name: 'Proceed to pay' }));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Booking confirmed', expect.any(String), expect.any(Array)),
    );
    const [saved] = await getBookings();
    expect(saved).toMatchObject({
      movieId: '42',
      title: 'Hope',
      date: '2026-12-01',
      hallId: 'h1',
      total: 50,
      seats: [{ id: regular.id, row: regular.row, number: regular.number, kind: 'regular' }],
    });
  });

  it('asks the user to pick a seat instead of saving an empty booking', async () => {
    await renderSeats();

    fireEvent.press(await screen.findByRole('button', { name: 'Proceed to pay' }));

    expect(Alert.alert).toHaveBeenCalledWith('No seats selected', expect.any(String));
    expect(await getBookings()).toEqual([]);
  });

  it('shows seats the user already booked for this show as taken', async () => {
    const regular = firstFree('regular');
    await addBooking({
      movieId: SHOW.id,
      title: SHOW.title,
      posterPath: null,
      date: SHOW.date,
      hallId: SHOW.hallId,
      hallName: 'Hall 1',
      time: '12:30',
      seats: [{ id: regular.id, row: regular.row, number: regular.number, kind: 'regular' }],
      total: 50,
    });

    await renderSeats();

    await waitFor(() => expect(screen.getByLabelText(seatLabel(regular))).toBeDisabled());
    fireEvent.press(screen.getByLabelText(seatLabel(regular)));
    expect(screen.getByText('$ 0')).toBeVisible();
  });
});
