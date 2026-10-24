import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export function DataLoadError() {
  const router = useRouter();
  return <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6"><p role="alert">Данните не могат да бъдат заредени.</p><Button onClick={() => router.invalidate()}>Опитай отново</Button></div>;
}