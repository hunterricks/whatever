import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import '../../../models/User';  // This ensures the User model is registered
import { Types } from 'mongoose';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    console.log('Received job data:', body); // Debug log

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'location', 'scope', 'experienceLevel', 'budgetType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create job object with required fields
    const jobData: any = {
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      scope: body.scope,
      duration: body.duration,
      experienceLevel: body.experienceLevel,
      skills: body.skills,
      status: 'open',
      paymentStatus: 'pending',
      budgetType: body.budgetType,
      budget: undefined,
      minHourlyRate: undefined,
      maxHourlyRate: undefined,
    };

    // Add budget fields based on budget type
    if (body.budgetType === 'fixed') {
      jobData.budget = body.budget;
    } else if (body.budgetType === 'hourly') {
      jobData.minHourlyRate = body.minHourlyRate;
      jobData.maxHourlyRate = body.maxHourlyRate;
    } else {
      return NextResponse.json(
        { error: 'Invalid budget type' },
        { status: 400 }
      );
    }

    // Handle postedBy field
    if (body.postedBy && Types.ObjectId.isValid(body.postedBy)) {
      jobData.postedBy = body.postedBy;
    } else {
      return NextResponse.json(
        { error: 'Invalid postedBy ID' },
        { status: 400 }
      );
    }

    console.log('Creating job with data:', jobData); // Debug log

    // Save the job to the database
    const newJob = await Job.create(jobData);
    console.log('New job created:', newJob._id);

    return NextResponse.json(newJob, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error creating job', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const status = searchParams.get('status') || 'open';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const query: any = { status };
    
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseInt(minBudget);
      if (maxBudget) query.budget.$lte = parseInt(maxBudget);
    }

    const jobs = await Job.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .populate('postedBy', 'name')
      .lean();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Error fetching jobs' }, { status: 500 });
  }
}

