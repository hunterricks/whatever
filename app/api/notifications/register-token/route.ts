import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const { fcmToken } = await request.json();

    await User.findByIdAndUpdate(decoded.id, {
      $addToSet: { fcmTokens: fcmToken },
    });

    return NextResponse.json({ message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ error: 'Error registering token' }, { status: 500 });
  }
}
