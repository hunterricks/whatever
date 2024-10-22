import { NextResponse } from 'next/server';

// Mock jobs data
const mockJobs = [
  { _id: '1', title: 'Fix Leaky Faucet', description: 'Need a plumber to fix a leaky faucet in the kitchen', category: 'plumbing', budget: 100, status: 'open', postedBy: { name: 'John Doe' } },
  { _id: '2', title: 'Paint Living Room', description: 'Looking for a painter to paint my living room', category: 'painting', budget: 300, status: 'open', postedBy: { name: 'Jane Smith' } },
  { _id: '3', title: 'Install New Light Fixture', description: 'Need an electrician to install a new light fixture in the dining room', category: 'electrical', budget: 150, status: 'in_progress', postedBy: { name: 'Bob Johnson' } },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const minBudget = searchParams.get('minBudget');
  const maxBudget = searchParams.get('maxBudget');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  let filteredJobs = [...mockJobs];

  if (category) {
    filteredJobs = filteredJobs.filter(job => job.category === category);
  }

  if (status) {
    filteredJobs = filteredJobs.filter(job => job.status === status);
  }

  if (minBudget && maxBudget) {
    filteredJobs = filteredJobs.filter(job => job.budget >= parseInt(minBudget) && job.budget <= parseInt(maxBudget));
  }

  // Sort jobs
  filteredJobs.sort((a, b) => {
    if (sortBy === 'budget') {
      return sortOrder === 'asc' ? a.budget - b.budget : b.budget - a.budget;
    }
    // For simplicity, we'll just use the _id for createdAt sorting
    return sortOrder === 'asc' ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id);
  });

  return NextResponse.json(filteredJobs);
}

export async function POST(request: Request) {
  const jobData = await request.json();
  const newJob = {
    _id: (mockJobs.length + 1).toString(),
    ...jobData,
    status: 'open',
    postedBy: { name: 'Current User' }, // In a real app, this would be the authenticated user
  };
  mockJobs.push(newJob);
  return NextResponse.json(newJob, { status: 201 });
}