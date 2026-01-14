import { NextResponse } from 'next/server'
import { isAdvertisementEnabled } from '@/lib/admin/settings'

export const runtime = 'edge'

export async function GET() {
  try {
    const enabled = await isAdvertisementEnabled()
    return NextResponse.json({ enabled })
  } catch (error) {
    console.error('Error fetching advertisement setting:', error)
    // Default to enabled on error
    return NextResponse.json({ enabled: true })
  }
}
