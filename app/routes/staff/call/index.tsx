import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import CallComponent from '~/components/staff/call/CallComponent';

export const Route = createFileRoute('/staff/call/')({
  component: () => (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      }
    >
      <CallComponent />
    </ClientOnly>
  ),
});
