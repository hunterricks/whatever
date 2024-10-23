import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { NextApiRequest } from 'next/types';

export async function GET(request: NextApiRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const totalJobsPosted = await Job.countDocuments({ postedBy: token.sub });
    const totalJobsCompleted = await Job.countDocuments({ postedBy: token.sub, status: 'completed' });

    const aggregateResult = await Job.aggregate([
      { $match: { postedBy: token.sub } },
      { $group: { _id: null, averageBudget: { $avg: "$budget" } } }
    ]);
    const averageJobBudget = aggregateResult[0]?.averageBudget || 0;

    const jobsByCategory = await Job.aggregate([
      { $match: { postedBy: token.sub } },
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
