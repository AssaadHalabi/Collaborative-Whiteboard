import Stripe from "stripe";

export const isSubscriptionValid = (subscription: Stripe.Subscription) => {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in Unix timestamp
    return subscription.status === 'active' && subscription.current_period_end > currentTimestamp;
};
