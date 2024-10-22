"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function ClientDashboard() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
    } else if (user?.role !== 'homeowner') {
      router.push('/dashboard/contractor');
    }
  }, [user, router, checkAuth]);

  if (!checkAuth() || user?.role !== 'homeowner') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Client Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Post a New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create a new job listing for contractors to bid on.</p>
            <Button asChild className="mt-4">
              <Link href="/post-job">Post a Job</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage your current job listings.</p>
            <Button asChild className="mt-4">
              <Link href="/my-jobs">View Jobs</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Update your profile information and settings.</p>
            <Button asChild className="mt-4">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}