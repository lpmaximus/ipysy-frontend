import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'ipysy-frontend',
    version: process.env.NEXT_PUBLIC_VERSION ?? '0.0.1-dev',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? 'development',
    timestamp: new Date().toISOString(),
  })
}
