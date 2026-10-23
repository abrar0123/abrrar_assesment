import { Alert, AlertButton } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import TabLayout from '@/app/(tabs)/_layout';
import DashboardScreen from '@/app/(tabs)/dashboard';
import { addBooking } from '@/src/features/booking';
import { createWrapper } from '@/src/test/render';

const renderDashboard = () =>
  renderRouter(
    {
      '(tabs)/_layout': TabLayout,
      '(tabs)/dashboard': DashboardScreen,
      '(tabs)/watch': () => null,
      '(tabs)/media-library': () => null,
      '(tabs)/more': () => null,
    },
    { initialUrl: '/dashboard', wrapper: createWrapper() },
  );

const saveBooking = () =>
  addBooking({
    movieId: '42',
    title: 'Hope',
    posterPath: null,
    date: '2026-10-22',
    hallId: 'h1',
    hallName: 'Hall 1',
    time: '12:30',
    seats: [
      { id: '5-6', row: 5, number: 6, kind: 'regular' },
      { id: '10-7', row: 10, number: 7, kind: 'vip' },
    ],
    total: 200,
  });

beforeEach(() => AsyncStorage.clear());
afterEach(() => jest.restoreAllMocks());

describe('Dashboard', () => {
  it('guides the user to book something when there are no bookings', async () => {
    renderDashboard();

    expect(await screen.findByText('No bookings yet')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Browse movies' })).toBeVisible();
  });

  it('lists saved bookings with their seats and total', async () => {
    await saveBooking();
    renderDashboard();

    expect(await screen.findByText('Hope')).toBeVisible();
    expect(screen.getByText('2 seats (1 VIP) · R5-6, R10-7')).toBeVisible();
    expect(screen.getByText('$ 200')).toBeVisible();
    expect(screen.getByText('1 booking')).toBeVisible();
  });

  it('cancels a booking only after the user confirms', async () => {
    await saveBooking();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderDashboard();

    fireEvent.press(await screen.findByRole('button', { name: 'Cancel' }));
    const buttons = alert.mock.calls[0][2] as AlertButton[];
    expect(buttons.map((b) => b.text)).toEqual(['Keep', 'Cancel booking']);

    await act(async () => {
      await buttons.find((b) => b.text === 'Cancel booking')!.onPress!();
    });

    expect(await screen.findByText('No bookings yet')).toBeVisible();
  });
});
