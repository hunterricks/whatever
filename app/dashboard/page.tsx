"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
    
    if (user?.activeRole === 'homeowner') {
      router.push('/dashboard/homeowner');
    } else if (user?.activeRole === 'contractor') {
      router.push('/dashboard/contractor');
    }
  }, [user?.activeRole, router, checkAuth]);

  // Render loading state or null while checking authentication
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <p>Redirecting to your role-specific dashboard...</p>
      <Button asChild className="mt-8">
        <Link href="/dashboard/analytics">
          <BarChart3 className="mr-2 h-4 w-4" />
          View Analytics
        </Link>
      </Button>
    </div>
  );
}
