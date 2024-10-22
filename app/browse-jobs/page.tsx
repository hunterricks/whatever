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
import { useAuthStore } from "@/lib/mockAuth";
import { useRouter } from 'next/navigation';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'contractor') {
      router.push('/login');
    } else {
      fetchJobs();
    }
  }, [categoryFilter, statusFilter, budgetRange, sortBy, sortOrder, user, router]);

  async function fetchJobs() {
    try {
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
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      toast.error("Error fetching jobs");
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'contractor') {
    return null; // Don't render anything if not a contractor
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Available Jobs</h1>
      {/* ... (keep the existing filter and search UI) ... */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <Card key={job._id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <Badge>{job.category}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
              <p className="font-semibold">Budget: ${job.budget}</p>
              <Badge variant={job.status === 'open' ? 'default' : job.status === 'in_progress' ? 'secondary' : 'outline'}>
                {job.status}
              </Badge>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/jobs/${job._id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {filteredJobs.length === 0 && (
        <p className="text-center mt-8">No jobs found matching your search criteria.</p>
      )}
    </div>
  );
}