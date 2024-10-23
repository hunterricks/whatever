"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useRouter } from 'next/navigation';

interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  location: string;
  duration: number;
  postedBy: string;
  createdAt: string;
}

const BrowseJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchJobs = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult);
      if (!authResult) {
        router.push('/login');
        return;
      }

      if (user?.activeRole !== 'contractor') {
        router.push('/dashboard/homeowner');
        return;
      }

      fetchJobs();
    };

    checkAuthAndFetchJobs();
  }, [categoryFilter, statusFilter, budgetRange, sortBy, sortOrder, user, router, checkAuth]);

  async function fetchJobs() {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        category: categoryFilter !== "all" ? categoryFilter : "",
        status: statusFilter !== "all" ? statusFilter : "",
        minBudget: budgetRange[0].toString(),
        maxBudget: budgetRange[1].toString(),
        sortBy,
        sortOrder,
      });
      const response = await fetch(`/api/jobs?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data: Job[] = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error("Error fetching jobs");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated || (user && user.activeRole !== 'contractor')) {
    return null;
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Available Jobs</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="renovation">Renovation</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="painting">Painting</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{job.title}</span>
                  <Badge>{job.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {job.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Budget:</span>
                    <span className="text-sm">${job.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{job.duration} months</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/jobs/${job._id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BrowseJobsPage;
