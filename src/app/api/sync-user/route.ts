import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getAllowedEmailDomains } from '@/lib/auth-utils';

function determineUserType(email: string, role: string): string {
  if (role === 'ADMIN') return 'ADMIN';
  
  const allowedDomains = getAllowedEmailDomains();
  const isInternalDomain = allowedDomains.some(domain => 
    email.toLowerCase().endsWith(domain.toLowerCase())
  );
  
  if (isInternalDomain) return 'EMPLOYEE';
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

    // Check if user exists in database by clerkId first, then by email
    let existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!existingUser) {
      existingUser = await prisma.user.findUnique({
        where: { email }
      });
    }

    if (existingUser) {
      // Update the clerkId if it's different
      if (existingUser.clerkId !== userId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkId: userId }
        });
        console.log(`✅ Updated clerkId for user: ${email}`);
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
        console.log(`✅ Updated userType for user: ${email} -> ${userType}`);
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
      
      try {
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
          try {
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
          } catch (employeeError) {
            console.error('❌ Error creating employee record:', employeeError);
            // Don't fail the whole request if employee creation fails
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
      } catch (createError) {
        console.error('❌ Error creating user:', createError);
        
        // If user creation failed due to duplicate, try to find the existing user
        const duplicateUser = await prisma.user.findUnique({
          where: { email }
        });
        
        if (duplicateUser) {
          // Update clerkId and return existing user
          await prisma.user.update({
            where: { id: duplicateUser.id },
            data: { clerkId: userId }
          });
          
          return NextResponse.json({
            message: 'User found and updated',
            user: {
              id: duplicateUser.id,
              email: duplicateUser.email,
              role: duplicateUser.role,
              userType: duplicateUser.userType,
              clerkId: userId
            }
          });
        }
        
        throw createError;
      }
    }
  } catch (error) {
    console.error('Failed to sync user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
