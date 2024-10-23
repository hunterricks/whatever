import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import Job from '@/models/Job';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    await dbConnect();
    const body = await request.json();

    // Check if the job exists and is still open
    const job = await Job.findById(body.jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.status !== 'open') {
      return NextResponse.json({ error: 'Job is no longer accepting proposals' }, { status: 400 });
    }

    // Check if the contractor has already submitted a proposal
    const existingProposal = await Proposal.findOne({
      job: body.jobId,
      serviceProvider: decoded.userId,
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this job' },
        { status: 400 }
      );
    }

    const newProposal = await Proposal.create({
      ...body,
      job: body.jobId,
      serviceProvider: decoded.userId,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json(newProposal, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Error creating proposal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const serviceProvider = searchParams.get('serviceProvider');

    const query: Record<string, unknown> = {};
    if (jobId) query.job = jobId;
    if (serviceProvider) query.serviceProvider = serviceProvider;

    const proposals = await Proposal.find(query)
      .populate('job', 'title')
      .populate('serviceProvider', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Error fetching proposals' },
      { status: 500 }
    );
  }
}
