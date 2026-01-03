import { NextRequest, NextResponse } from 'next/server'
import { createSubscription } from '@/lib/actions/subscriptions'
import { getUser } from '@/lib/auth'

// Prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('Subscription create API called')
    
    // Check authentication
    const user = await getUser()
    console.log('User from getUser:', user ? { id: user.id, email: user.email } : 'null')
    
    if (!user) {
      console.error('No user found in subscription create API')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planType } = body
    console.log('Plan type:', planType)

    if (!planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['monthly', 'semester'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Get user's email and phone from user metadata
    const userEmail = user.email || user.user_metadata?.email
    const userPhone = user.user_metadata?.phone

    const { data: subscription, error } = await createSubscription({
      userId: user.id,
      email: userEmail,
      phone: userPhone,
      planType
    })

    if (error) {
      console.error('Subscription creation error:', error)
      return NextResponse.json(
        { error },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
