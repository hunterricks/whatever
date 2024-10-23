import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const totalJobsPosted = await Job.countDocuments({ postedBy: session.user.id });
    const totalJobsCompleted = await Job.countDocuments({ postedBy: session.user.id, status: 'completed' });

    const aggregateResult = await Job.aggregate([
      { $match: { postedBy: session.user.id } },
      { $group: { _id: null, averageBudget: { $avg: "$budget" } } }
    ]);
    const averageJobBudget = aggregateResult[0]?.averageBudget || 0;

    const jobsByCategory = await Job.aggregate([
      { $match: { postedBy: session.user.id } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } }
    ]);

    const analytics = {
      totalJobsPosted,
      totalJobsCompleted,
      averageJobBudget,
      jobsByCategory
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Error fetching analytics' }, { status: 500 });
  }
}