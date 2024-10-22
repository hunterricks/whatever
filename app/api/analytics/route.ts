import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
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

    const totalJobsPosted = await Job.countDocuments({ postedBy: decoded.id });
    const totalJobsCompleted = await Job.countDocuments({ postedBy: decoded.id, status: 'completed' });

    const aggregateResult = await Job.aggregate([
      { $match: { postedBy: decoded.id } },
      { $group: { _id: null, averageBudget: { $avg: "$budget" } } }
    ]);
    const averageJobBudget = aggregateResult[0]?.averageBudget || 0;

    const jobsByCategory = await Job.aggregate([
      { $match: { postedBy: decoded.id } },
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
