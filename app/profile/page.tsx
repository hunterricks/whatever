"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StarIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Profile() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user);
  const [reviews, setReviews] = useState([
    { id: 1, rating: 5, reviewer: { name: "John Doe" }, comment: "Great work!" },
    { id: 2, rating: 4, reviewer: { name: "Jane Smith" }, comment: "Very professional" }
  ]);

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
    setProfile(user);
  }, [user, router, checkAuth]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!checkAuth() || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  id="name"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev!, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  id="email"
                  value={profile?.email || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev!, email: e.target.value }))}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p><strong>Name:</strong> {profile?.name}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Role:</strong> {profile?.role}</p>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.map((review) => (
            <div key={review.id} className="mb-4 p-4 border rounded">
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="font-semibold">{review.reviewer.name}</p>
              <p>{review.comment}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}