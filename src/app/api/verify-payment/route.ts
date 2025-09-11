import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { reference, packageName } = await request.json();
    
    if (!reference) {
      return NextResponse.json(
        { success: false, message: 'Missing reference' },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set');
      return NextResponse.json(
        { success: false, message: 'Server payment config missing' },
        { status: 500 }
      );
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}` , {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const data = await verifyRes.json();

    if (!verifyRes.ok) {
      console.error('Paystack verify error:', data);
      return NextResponse.json(
        { success: false, message: data?.message || 'Verification failed' },
        { status: 400 }
      );
    }

    const status = data?.data?.status;

    if (status === 'success') {
      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified successfully',
        reference,
        packageName,
        grantAccess: true
      });
    }

    return NextResponse.json(
      { success: false, message: 'Payment not successful', status },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
