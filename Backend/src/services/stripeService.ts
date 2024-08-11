import Stripe from "stripe";
import { convertUnixToDate } from "../utils/convertUnixToDate";
import { isSubscriptionValid } from "../utils/isSubscriptionValid";
// import { getUserByEmail, updateUserSubscriptionStatus } from '../utils/db';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY as string);

// const createSubscription = async (email: string, paymentMethodId: string, priceId: string): Promise<Stripe.Subscription> => {
//     const user = await getUserByEmail(email) as User;
//     if (user && user.subscription_id) {
//         const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
//         if (subscription && subscription.status === 'active') {
//             throw new Error('Customer already has an active subscription');
//         }
//     }

//     const customers = await stripe.customers.list({
//         email: email,
//         limit: 1
//     });

//     let customer: Stripe.Customer;
//     if (customers.data.length > 0) {
//         customer = customers.data[0];
//     } else {
//         customer = await stripe.customers.create({
//             email: email,
//             payment_method: paymentMethodId,
//             invoice_settings: {
//                 default_payment_method: paymentMethodId,
//             },
//         });
//     }

//     const subscription = await stripe.subscriptions.create({
//         customer: customer.id,
//         items: [{ price: priceId }],
//         expand: ['latest_invoice.payment_intent'],
//     });

//     if (user) {
//         await updateUserSubscriptionStatus(user.id, subscription.id);
//     } else {
//         // Handle the case where the user does not exist in your database
//     }

//     return subscription;
// };

export const createCheckoutSession = async (
  priceId: string,
  customerEmail: string,
): Promise<Stripe.Checkout.Session> => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.FRONTEND_URL}/profile`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    customer_email: customerEmail,
  });
  console.log(session.subscription);
  return session;
};

export const getSubscription = async (
  email: string,
): Promise<Stripe.Subscription> => {
  const customers = await stripe.customers.list({
    email: email,
    limit: 1,
  });
  if (customers.data.length === 0)
    throw new Error(`Customer with email ${email} doesn't exist`);

  const customer = customers.data[0];
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
  });
  const subscription = subscriptions.data[0];

  console.log(subscription);
  console.log(
    "billing_cycle_anchor:",
    convertUnixToDate(subscription.billing_cycle_anchor),
  );
  console.log("created:", convertUnixToDate(subscription.created));
  console.log(
    "current_period_end:",
    convertUnixToDate(subscription.current_period_end),
  );
  console.log(
    "current_period_start:",
    convertUnixToDate(subscription.current_period_start),
  );
  console.log("start_date:", convertUnixToDate(subscription.start_date));
  // console.log('plan.created:', convertUnixToDate(subscription.plan.created));
  // console.log('current_period_start less than current_period_end:', new Date(convertUnixToDate(subscription.current_period_end)) - new Date(convertUnixToDate(subscription.start_date)));

  if (isSubscriptionValid(subscription)) {
    console.log("The subscription is still valid.");
  } else {
    console.log("The subscription is no longer valid.");
  }
  return subscription;
};
