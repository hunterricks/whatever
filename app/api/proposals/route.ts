import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const serviceProvider = searchParams.get('serviceProvider');

    if (!serviceProvider) {
      return NextResponse.json({ error: 'Service provider ID is required' }, { status: 400 });
    }

    const proposals = await Proposal.find({ serviceProvider }).populate('job', 'title');
    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: 'Error fetching proposals' }, { status: 500 });
  }
}

// Keep the existing POST method
