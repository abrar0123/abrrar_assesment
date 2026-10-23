import { Redirect } from 'expo-router';

// The native splash covers startup (see app/_layout.tsx), so open the Watch tab directly.
export default function Index() {
  return <Redirect href="/watch" />;
}
