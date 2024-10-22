import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/Proposal';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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