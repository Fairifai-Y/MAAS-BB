import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Update customer package with Stripe subscription ID
  const customerPackage = await prisma.customerPackage.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (customerPackage) {
    await prisma.customerPackage.update({
      where: { id: customerPackage.id },
      data: { status: 'ACTIVE' }
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerPackage = await prisma.customerPackage.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (customerPackage) {
    const status = subscription.status === 'active' ? 'ACTIVE' : 'SUSPENDED';
    await prisma.customerPackage.update({
      where: { id: customerPackage.id },
      data: { status }
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerPackage = await prisma.customerPackage.findFirst({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (customerPackage) {
    await prisma.customerPackage.update({
      where: { id: customerPackage.id },
      data: { status: 'CANCELLED' }
    });
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const customerPackage = await prisma.customerPackage.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string }
    });

    if (customerPackage) {
      await prisma.invoice.create({
        data: {
          customerId: customerPackage.customerId,
          userId: customerPackage.customerId, // This should be the admin user ID
          amount: invoice.amount_paid / 100, // Convert from cents
          status: 'PAID',
          stripeInvoiceId: invoice.id,
          dueDate: new Date(invoice.due_date! * 1000),
          paidAt: new Date()
        }
      });
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const customerPackage = await prisma.customerPackage.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string }
    });

    if (customerPackage) {
      await prisma.invoice.create({
        data: {
          customerId: customerPackage.customerId,
          userId: customerPackage.customerId, // This should be the admin user ID
          amount: invoice.amount_due / 100, // Convert from cents
          status: 'OVERDUE',
          stripeInvoiceId: invoice.id,
          dueDate: new Date(invoice.due_date! * 1000)
        }
      });
    }
  }
} 