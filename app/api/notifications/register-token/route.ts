import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { fcmToken } = await request.json();

    await User.findByIdAndUpdate(token.sub, {
      $addToSet: { fcmTokens: fcmToken },
    });

    return NextResponse.json({ message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ error: 'Error registering token' }, { status: 500 });
  }
}
