// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY || "yes");  // Use test secret key

// const createSubscription = async (email, paymentMethodId, priceId) => {
//     const user = await getUserByEmail(email);
//     if (user && user.subscription_id) {
//         // Check if the subscription is still active
//         const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
//         if (subscription && subscription.status === 'active') {
//             throw new Error('Customer already has an active subscription');
//         }
//     }

//     // Check if the customer already exists in Stripe
//     const customers = await stripe.customers.list({
//         email: email,
//         limit: 1
//     });

//     let customer;
//     if (customers.data.length > 0) {
//         customer = customers.data[0];
//     } else {
//         // Create a new customer in Stripe
//         customer = await stripe.customers.create({
//             email: email,
//             payment_method: paymentMethodId,
//             invoice_settings: {
//                 default_payment_method: paymentMethodId,
//             },
//         });
//     }

//     // Create a new subscription in Stripe
//     const subscription: Stripe.Subscription = await stripe.subscriptions.create({
//         customer: customer.id,
//         items: [{ price: priceId }],
//         expand: ['latest_invoice.payment_intent'],
//     });

//     // Update the user record with the new subscription ID
//     if (user) {
//         await updateUserSubscriptionStatus(user.id, subscription.id);
//     } else {
//         // Handle the case where the user does not exist in your database
//         // You might want to create a new user record here
//     }

//     return subscription;
// };

// const createCheckoutSession = async (priceId) => {
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: [
//             {
//                 price: priceId,
//                 quantity: 1,
//             },
//         ],
//         mode: 'subscription',
//         success_url: `${process.env.FRONTEND_URL}/success`,
//         cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//     });
//     session.subscription
//     return session;
// };

// module.exports = {createSubscription, createCheckoutSession}
