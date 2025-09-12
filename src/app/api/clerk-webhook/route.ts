import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { getAllowedEmailDomains } from '@/lib/auth-utils';

function determineUserType(email: string): string {
  const allowedDomains = getAllowedEmailDomains();
  const isInternalDomain = allowedDomains.some(domain => 
    email.toLowerCase().endsWith(domain.toLowerCase())
  );
  
  if (isInternalDomain) return 'EMPLOYEE';
  return 'CUSTOMER';
}

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`🔔 Clerk webhook received: ${eventType}`);
    console.log(`📊 Event data:`, JSON.stringify(evt.data, null, 2));

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      if (email_addresses && email_addresses.length > 0) {
        const email = email_addresses[0].email_address;
        const name = first_name && last_name ? `${first_name} ${last_name}` : first_name || 'User';
        
        console.log(`👤 New user created: ${name} (${email})`);

        try {
          // Check if user already exists by clerkId first, then by email
          let existingUser = await prisma.user.findUnique({
            where: { clerkId: id }
          });

          if (!existingUser) {
            existingUser = await prisma.user.findUnique({
              where: { email }
            });
          }

          if (existingUser) {
            // Update clerkId if it's different
            if (existingUser.clerkId !== id) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { clerkId: id }
              });
              console.log(`✅ Updated clerkId for existing user: ${email}`);
            }
            
            // Update userType if not set
            if (!existingUser.userType) {
              const userType = determineUserType(email);
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  userType,
                  isInternal: userType !== 'CUSTOMER'
                }
              });
              console.log(`✅ Updated userType for existing user: ${email} -> ${userType}`);
            }

            // Ensure employee record exists for internal users
            if (existingUser.userType === 'EMPLOYEE' || existingUser.userType === 'ADMIN') {
              const existingEmployee = await prisma.employees.findUnique({
                where: { userId: existingUser.id }
              });

              if (!existingEmployee) {
                await prisma.employees.create({
                  data: {
                    id: existingUser.id,
                    userId: existingUser.id,
                    hourlyRate: 0,
                    contractHours: 40,
                    isActive: true,
                    function: existingUser.userType === 'ADMIN' ? 'Admin' : 'Medewerker',
                    department: existingUser.userType === 'ADMIN' ? 'Management' : 'Operations',
                    internalHourlyRate: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                });
                console.log(`✅ Created employee record for existing user: ${email}`);
              }
            }

            console.log(`✅ User already exists and updated: ${email}`);
            return NextResponse.json({ message: 'User already exists and updated' });
          }

          // Determine user type
          const userType = determineUserType(email);

          // Create user in database
          const newUser = await prisma.user.create({
            data: {
              clerkId: id,
              email,
              name,
              role: 'CUSTOMER', // Default role
              userType,
              isInternal: userType !== 'CUSTOMER'
            }
          });

          // Only create employee record for internal users
          if (userType === 'EMPLOYEE' || userType === 'ADMIN') {
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
            console.log(`✅ Created employee record for internal user: ${email}`);
          }

          console.log(`✅ Created user (${userType}) for: ${email}`);
        } catch (error) {
          console.error('❌ Error creating user/employee record:', error);
          // Return 200 to prevent webhook retries, but log the error
          return NextResponse.json({ 
            message: 'User creation failed but webhook processed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } else if (eventType === 'email.created' || eventType === 'email.updated' || eventType === 'email.verified') {
      // Handle email verification events
      console.log(`📧 Email event received: ${eventType}`);
      const { email_address, verification } = evt.data;
      
      if (email_address && verification) {
        console.log(`📧 Email verification status for ${email_address}: ${verification.status}`);
      }
    } else if (eventType === 'session.created' || eventType === 'session.ended') {
      // Handle session events
      console.log(`🔐 Session event received: ${eventType}`);
    } else {
      // Log any other events for debugging
      console.log(`🔔 Unhandled Clerk event: ${eventType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
