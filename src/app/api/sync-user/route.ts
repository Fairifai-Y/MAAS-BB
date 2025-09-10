import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

function determineUserType(email: string, role: string): string {
  if (role === 'ADMIN') return 'ADMIN';
  if (email.includes('@fitchannel.com')) return 'EMPLOYEE';
  return 'CUSTOMER';
}

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

      // Update userType if not set (backward compatibility)
      if (!existingUser.userType) {
        const userType = determineUserType(existingUser.email, existingUser.role);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            userType,
            isInternal: userType !== 'CUSTOMER'
          }
        });
        existingUser.userType = userType;
      }

      // Only create employee record for internal users
      if (existingUser.userType === 'EMPLOYEE' || existingUser.userType === 'ADMIN') {
        const existingEmployee = await prisma.employees.findUnique({
          where: { userId: existingUser.id }
        });

        if (!existingEmployee) {
          // Create employee record for internal user
          await prisma.employees.create({
            data: {
              id: existingUser.id,
              userId: existingUser.id,
              hourlyRate: 0, // Default rate, can be updated later
              contractHours: 40,
              isActive: true,
              function: existingUser.userType === 'ADMIN' ? 'Admin' : 'Medewerker',
              department: existingUser.userType === 'ADMIN' ? 'Management' : 'Operations',
              internalHourlyRate: 0, // Default rate, can be updated later
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`✅ Created employee record for internal user: ${existingUser.email}`);
        }
      }

      return NextResponse.json({
        message: 'User synced successfully',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          userType: existingUser.userType,
          clerkId: userId
        }
      });
    } else {
      // Determine user type for new user
      const userType = determineUserType(email, 'CUSTOMER');
      
      // Create new user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: clerkUserData.first_name && clerkUserData.last_name 
            ? `${clerkUserData.first_name} ${clerkUserData.last_name}`
            : clerkUserData.first_name || 'User',
          role: 'CUSTOMER', // Default role
          userType,
          isInternal: userType !== 'CUSTOMER'
        }
      });

      // Only create employee record for internal users
      if (userType === 'EMPLOYEE' || userType === 'ADMIN') {
        const existingEmployee = await prisma.employees.findUnique({
          where: { userId: newUser.id }
        });

        if (!existingEmployee) {
          // Automatically create employee record for internal user
          await prisma.employees.create({
            data: {
              id: newUser.id,
              userId: newUser.id,
              hourlyRate: 0, // Default rate, can be updated later
              contractHours: 40,
              isActive: true,
              function: userType === 'ADMIN' ? 'Admin' : 'Medewerker',
              department: userType === 'ADMIN' ? 'Management' : 'Operations',
              internalHourlyRate: 0, // Default rate, can be updated later
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`✅ Created employee record for new internal user: ${newUser.email}`);
        }
      }

      console.log(`✅ Created user (${userType}) for: ${newUser.email}`);

      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          userType: newUser.userType,
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
