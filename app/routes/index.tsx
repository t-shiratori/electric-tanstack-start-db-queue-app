import { createFileRoute, ClientOnly } from '@tanstack/react-router'
import HomeComponent from '~/components/home/HomeComponent'

export const Route = createFileRoute('/')({
  component: () => (
    <ClientOnly fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">読み込み中...</div></div>}>
      <HomeComponent />
    </ClientOnly>
  ),
})
