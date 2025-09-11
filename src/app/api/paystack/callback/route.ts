import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  const reference = search.get('reference')
  const packageName = search.get('package') || undefined

  if (!reference) {
    return NextResponse.redirect(new URL('/?payment=missing_reference', request.nextUrl))
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.redirect(new URL('/?payment=server_config_error', request.nextUrl))
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: 'no-store'
  })
  const data = await verifyRes.json()

  if (verifyRes.ok && data?.data?.status === 'success') {
    // TODO: grant VIP, persist, etc.
    return NextResponse.redirect(new URL(`/?payment=success&ref=${encodeURIComponent(reference)}&package=${encodeURIComponent(packageName || '')}`, request.nextUrl))
  }

  return NextResponse.redirect(new URL(`/?payment=failed&reason=${encodeURIComponent(data?.message || 'unknown')}`, request.nextUrl))
}


