// // app/api/webhook/stripe/route.ts
// // strong-reward-feisty-endear
// import Stripe from "stripe";
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";

// import prismadb from "@/lib/prismadb";
// import { stripe } from "@/lib/stripe";

// export async function POST(req: Request) {
//   const body = await req.text();
//   const signature = (await headers()).get("Stripe-Signature") as string;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (error: any) {
//     return new NextResponse(`Webhook Error: ${error.message}`, {
//       status: 400,
//     });
//   }

//   // 1) Checkout completed -> create subscription record
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session;

//     if (!session?.metadata?.userId) {
//       return new NextResponse("User id is required", { status: 400 });
//     }

//     const subscription = (await stripe.subscriptions.retrieve(
//       session.subscription as string
//     )) as Stripe.Subscription;

//     const currentPeriodEnd = (subscription as any)
//       .current_period_end as number;

//     await prismadb.userSubscription.create({
//       data: {
//         userId: session.metadata.userId,
//         stripeSubscriptionId: subscription.id,
//         stripeCustomerId: subscription.customer as string,
//         stripePriceId: subscription.items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
//       },
//     });
//   }

//   // 2) Invoice paid -> update subscription record (renewal)
//   if (event.type === "invoice.payment_succeeded") {
//     // 👇 Cast to any so TS stops whining about `subscription`
//     const invoice = event.data.object as any;

//     if (!invoice.subscription) {
//       return new NextResponse("No subscription on invoice", {
//         status: 400,
//       });
//     }

//     const subscription = (await stripe.subscriptions.retrieve(
//       invoice.subscription as string
//     )) as Stripe.Subscription;

//     const currentPeriodEnd = (subscription as any)
//       .current_period_end as number;

//     await prismadb.userSubscription.update({
//       where: {
//         stripeSubscriptionId: subscription.id,
//       },
//       data: {
//         stripePriceId: subscription.items.data[0].price.id,
//         stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
//       },
//     });
//   }

//   return new NextResponse(null,{status:200});
// }
// app/api/stripe/route.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1) Check if we already have a subscription for this user
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    // If they already have a Stripe customer, send them to the billing portal
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    // 2) Otherwise, create a new checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0].emailAddress,

      // Use your price ID here
      line_items: [
        {
          price: process.env.STRIPE_MONTHLY_PLAN_ID!, // e.g. price_123
          quantity: 1,
        },
      ],

      // 👇 THIS is the important part
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
