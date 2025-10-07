import { AppProvider } from '@/hooks/use-app-store';
import MainLayout from '@/components/app/main-layout';

export default function Home() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
