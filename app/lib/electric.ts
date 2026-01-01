import { ShapeStream } from '@electric-sql/client'

// ElectricSQL configuration
export const ELECTRIC_URL = import.meta.env.VITE_ELECTRIC_URL || 'http://localhost:3000'

// Database write endpoint (direct writes to PostgreSQL through Electric)
export const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/queue_app'

// Helper to create a shape stream for a table
export function createShapeStream<T extends Record<string, unknown> = Record<string, unknown>>(
  table: string,
  where?: string
) {
  const url = new URL(`${ELECTRIC_URL}/v1/shape`)
  url.searchParams.set('table', table)
  if (where) {
    url.searchParams.set('where', where)
  }

  return new ShapeStream<T>({
    url: url.toString(),
  })
}

// Write operations helper (will be used with TanStack DB)
export async function writeToDatabase(
  sql: string,
  params?: unknown[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, this would go through Electric's proxy
    // For now, we'll use direct PostgreSQL connection
    const response = await fetch('/api/db/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    })

    if (!response.ok) {
      throw new Error(`Database write failed: ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Database write error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
