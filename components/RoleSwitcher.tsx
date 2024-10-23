"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { UserCircle } from "lucide-react";
import type { UserRole } from "@/lib/auth";
import { useRouter } from 'next/navigation';

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const router = useRouter();

  if (!user?.roles || user.roles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = (role: UserRole) => {
    if (role !== user.activeRole) {
      switchRole(role);
      router.push(`/dashboard/${role}`);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    return role === 'homeowner' ? 'Homeowner' : 'Contractor';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserCircle className="h-4 w-4" />
          {getRoleLabel(user.activeRole)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user.roles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`gap-2 cursor-pointer ${role === user.activeRole ? 'bg-primary/5' : ''}`}
          >
            <UserCircle className="h-4 w-4" />
            Switch to {getRoleLabel(role)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}