import { createFileRoute, ClientOnly } from '@tanstack/react-router'
import EntryComponent from '~/components/entry/EntryComponent'

function EntryPage() {
  const { token } = Route.useParams()
  return <EntryComponent token={token} />
}

export const Route = createFileRoute('/entry/$token')({
  component: () => (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      }
    >
      <EntryPage />
    </ClientOnly>
  ),
})
