import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import stripe from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { jobId, amount } = await request.json();

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.postedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'usd',
      metadata: { jobId },
    });

    await Job.findByIdAndUpdate(jobId, {
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'escrow',
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Error creating payment intent' }, { status: 500 });
  }
}