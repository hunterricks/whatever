"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/lib/auth";
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, checkAuth } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    return user?.role === 'homeowner' ? '/dashboard/client' : '/dashboard/contractor';
  };

  const isAuthenticated = checkAuth();

  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          WHATEVER™
        </Link>
        <nav className="flex items-center space-x-4">
          {isAuthenticated && user?.role === 'contractor' && (
            <Link href="/browse-jobs" className="hover:text-primary">
              Find Work
            </Link>
          )}
          {isAuthenticated && user?.role === 'homeowner' && (
            <Link href="/post-job" className="hover:text-primary">
              Post a Job
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="hover:text-primary">Welcome, {user.name}</span>
              <Link href={getDashboardLink()} className="hover:text-primary">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-primary">
                Profile
              </Link>
              <Button onClick={handleSignOut} variant="outline">Log Out</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary">
                Log In
              </Link>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}