// In-memory AsyncStorage and a controllable NetInfo for tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// The TMDb client refuses to run without a key; tests talk to a fake server anyway.
process.env.EXPO_PUBLIC_TMDB_API_KEY = 'test-key';
