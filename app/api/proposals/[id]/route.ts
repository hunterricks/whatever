import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import Job from '@/models/Job';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    await dbConnect();
    const proposal = await Proposal.findById(params.id)
      .populate('job')
      .populate('serviceProvider', 'name');

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json(
      { error: 'Error fetching proposal' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    await dbConnect();
    const body = await request.json();
    const { status } = body;

    const proposal = await Proposal.findById(params.id);
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (status === 'accepted') {
      await Job.findByIdAndUpdate(proposal.job, {
        status: 'in_progress',
      });

      await Proposal.updateMany(
        {
          job: proposal.job,
          _id: { $ne: params.id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    const updatedProposal = await Proposal.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Error updating proposal' },
      { status: 500 }
    );
  }
}
