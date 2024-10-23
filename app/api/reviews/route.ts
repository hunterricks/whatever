import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Job from '@/models/Job';
import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    const job = await Job.findById(body.job);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'completed') {
      return NextResponse.json({ error: 'Job must be completed before submitting a review' }, { status: 400 });
    }

    const review = await Review.create({
      ...body,
      reviewer: session.user.id,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error creating review' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const reviews = await Review.find({ reviewee: userId }).populate('reviewer', 'name').populate('job', 'title');
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Error fetching reviews' }, { status: 500 });
  }
}
