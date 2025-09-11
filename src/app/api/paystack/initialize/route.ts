import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, email, packageName } = await request.json()

    if (!amount || !email) {
      return NextResponse.json({ success: false, message: 'Missing amount or email' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ success: false, message: 'Server payment config missing' }, { status: 500 })
    }

    const origin = request.headers.get('origin') || request.nextUrl.origin
    const callback_url = `${origin}/api/paystack/callback?package=${encodeURIComponent(packageName || '')}`

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(amount) * 100),
        currency: 'GHS',
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        callback_url,
        metadata: {
          custom_fields: [
            { display_name: 'VIP Package', variable_name: 'vip_package', value: packageName }
          ]
        }
      }),
      cache: 'no-store'
    })

    const data = await initRes.json()
    if (!initRes.ok) {
      return NextResponse.json({ success: false, message: data?.message || 'Initialize failed' }, { status: 400 })
    }

    return NextResponse.json({ success: true, authorization_url: data?.data?.authorization_url, reference: data?.data?.reference })
  } catch (error) {
    console.error('Paystack initialize error', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}


