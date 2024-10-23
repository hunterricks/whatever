"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useRouter } from 'next/navigation';
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { RoleSwitcher } from "@/components/RoleSwitcher";

export default function Header() {
  const { user, logout, checkAuth } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    logout();
    // Force reload to clear any cached state
    window.location.href = '/login';
  };

  const getDashboardLink = () => {
    if (!user?.activeRole) return '/dashboard/homeowner';
    return `/dashboard/${user.activeRole}`;
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          WHATEVER™
        </Link>
        
        <nav className="flex items-center space-x-4">
          {checkAuth() && user ? (
            <>
              {user.activeRole === 'contractor' && (
                <Link href="/browse-jobs" className="hover:text-primary">
                  Find Work
                </Link>
              )}
              {user.activeRole === 'homeowner' && (
                <Link href="/post-job" className="hover:text-primary">
                  Post a Job
                </Link>
              )}
              <Link href="/messages" className="hover:text-primary">
                Messages
              </Link>
              <Link href={getDashboardLink()} className="hover:text-primary">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-primary">
                Profile
              </Link>
              {user.roles && user.roles.length > 1 && <RoleSwitcher />}
              <Button onClick={handleSignOut} variant="outline">Log Out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}