import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env/server'

const webhookSecret = env.AUTH_SECRET

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature') as string
  return NextResponse.json({ received: true })
}
