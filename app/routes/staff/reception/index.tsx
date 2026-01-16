import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import ReceptionComponent from '~/components/staff/reception/ReceptionComponent';

export const Route = createFileRoute('/staff/reception/')({
  component: () => (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      }
    >
      <ReceptionComponent />
    </ClientOnly>
  ),
});
