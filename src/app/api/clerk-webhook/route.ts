import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

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
          // Create user in database
          const newUser = await prisma.user.create({
            data: {
              clerkId: id,
              email,
              name,
              role: 'CUSTOMER' // Default role
            }
          });

          // Automatically create employee record
          await prisma.employees.create({
            data: {
              id: newUser.id,
              userId: newUser.id,
              hourlyRate: 0, // Default rate, can be updated later
              contractHours: 40,
              isActive: true,
              function: 'Medewerker',
              department: 'Operations',
              internalHourlyRate: 0, // Default rate, can be updated later
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          console.log(`✅ Created user and employee record for: ${email}`);
        } catch (error) {
          console.error('❌ Error creating user/employee record:', error);
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
