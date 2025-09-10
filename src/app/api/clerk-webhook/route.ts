import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

function determineUserType(email: string): string {
  if (email.includes('@fitchannel.com')) return 'EMPLOYEE';
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

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      if (email_addresses && email_addresses.length > 0) {
        const email = email_addresses[0].email_address;
        const name = first_name && last_name ? `${first_name} ${last_name}` : first_name || 'User';
        
        console.log(`👤 New user created: ${name} (${email})`);

        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          });

          if (existingUser) {
            console.log(`⚠️  User already exists: ${email}, skipping creation`);
            return NextResponse.json({ message: 'User already exists' });
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
            const existingEmployee = await prisma.employees.findUnique({
              where: { userId: newUser.id }
            });

            if (!existingEmployee) {
              // Automatically create employee record
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
            } else {
              console.log(`⚠️  Employee record already exists for: ${email}`);
            }
          }

          console.log(`✅ Created user (${userType}) for: ${email}`);
        } catch (error) {
          console.error('❌ Error creating user/employee record:', error);
          // Don't throw error to prevent webhook retries
        }
      }
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
