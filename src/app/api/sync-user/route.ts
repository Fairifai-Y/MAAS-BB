import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user info from Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!clerkUser.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user from Clerk' },
        { status: 500 }
      );
    }

    const clerkUserData = await clerkUser.json();
    const email = clerkUserData.email_addresses[0]?.email_address;

    if (!email) {
      return NextResponse.json(
        { error: 'No email found in Clerk user' },
        { status: 400 }
      );
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update the clerkId if it's different
      if (existingUser.clerkId !== userId) {
        await prisma.user.update({
          where: { email },
          data: { clerkId: userId }
        });
      }

      return NextResponse.json({
        message: 'User synced successfully',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          clerkId: userId
        }
      });
    } else {
      // Create new user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: clerkUserData.first_name && clerkUserData.last_name 
            ? `${clerkUserData.first_name} ${clerkUserData.last_name}`
            : clerkUserData.first_name || 'User',
          role: 'CUSTOMER' // Default role
        }
      });

      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          clerkId: userId
        }
      });
    }
  } catch (error) {
    console.error('Failed to sync user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
