"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const from = searchParams.get('from') || '/dashboard/client';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const mockUser = {
        id: 'mock-id',
        name: 'Test User',
        email: values.email,
        role: 'homeowner',
        token: `mock-token-${Date.now()}`,
      };
      
      login(mockUser);
      toast.success("Logged in successfully");
      router.push('/dashboard/homeowner');
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleQuickLogin = (role: 'homeowner' | 'contractor') => {
    const mockUser = {
      id: `mock-${role}-${Date.now()}`,
      name: role === 'homeowner' ? 'Test Homeowner' : 'Test Contractor',
      email: `test-${role}@example.com`,
      role,
      token: `mock-token-${role}-${Date.now()}`,
    };

    login(mockUser);
    toast.success(`Logged in as ${role}`);
    router.push(role === 'homeowner' ? '/dashboard/homeowner' : '/dashboard/contractor');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Log In</h1>
      <div className="space-y-4 max-w-md mb-8">
        <Button onClick={() => handleQuickLogin('homeowner')} className="w-full">
          Quick Login as Homeowner
        </Button>
        <Button onClick={() => handleQuickLogin('contractor')} className="w-full">
          Quick Login as Contractor
        </Button>
      </div>

      <div className="my-8 relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Form>
    </div>
  );
}