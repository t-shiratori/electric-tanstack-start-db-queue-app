import { createFileRoute, ClientOnly } from '@tanstack/react-router'
import DisplayComponent from '~/components/display/DisplayComponent'

export const Route = createFileRoute('/display/')({
  component: () => (
    <ClientOnly fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-gray-300">読み込み中...</div></div>}>
      <DisplayComponent />
    </ClientOnly>
  ),
})
