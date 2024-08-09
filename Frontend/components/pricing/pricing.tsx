"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import useAuth from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "./CheckIcon";
import { XIcon } from "./XIcon";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/ui/icons";
import Loader from "../Loader";
import { useStripe } from '@stripe/react-stripe-js';
import NavbarOuter from "../NavbarOuter";

export function Pricing() {
  const stripe = useStripe();
  const { loading, authenticated } = useAuth();
  const router = useRouter();

  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && authenticated) {
      setFetching(true)
      fetchSubscriptionStatus();
    } else {
      setFetching(false); // Ensure fetching is set to false if not authenticated
    }
  }, [loading, authenticated, router]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/api/subscriptions/status');
      setSubscriptionStatus(response.data);
      setIsPremium(Object.keys(response.data).length > 0 && response.data.type === 'PREMIUM' && response.data.status === 'ACTIVE');
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      setSubscriptionStatus(null);
      setIsPremium(false);
    } finally {
      setFetching(false); // Set fetching to false after fetching data
    }
  };

  const handleSignUp = () => {
    router.push("/authentication");
  };

  const handleUpgrade = async () => {
    if (!authenticated) {
      router.push("/authentication");
      return;
    }

    setUpgradeLoading(true);
    setError(null);
    try {
      if (!stripe) throw new Error(`Stripe is not available, its status is null`);
      const response = await api.post('/api/create-checkout-session', {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      });

      const { sessionId } = response.data;
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        setError(stripeError.message!);
      }
    } catch (error: any) {
      console.log(error);
      setError(`An error occurred during upgrade: ${error.message}`);
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading || fetching) return <Loader />;

  return (
    <>
      <NavbarOuter />
      <div className="w-full max-w-6xl mx-auto py-12 md:py-20 lg:py-24 px-4 md:px-6">
<div className="grid gap-8 md:gap-12 lg:gap-16">
  <div className="text-center space-y-4">
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Collaborative Whiteboard for Teams</h1>
    <p className="text-muted-foreground text-lg md:text-xl">
      Bring your team together with a powerful whiteboard tool.
    </p>
  </div>
  {error && <p className="text-red-600 text-center">{error}</p>}
  <div className="grid md:grid-cols-2 lg:g2">
    <Card>
      <CardHeader>
        <CardTitle>Free</CardTitle>
        <CardDescription>Up to 2 rooms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Unlimited users</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Real-time collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Fully Featured Whiteboard</span>
          </div>
          <div className="flex items-center gap-2">
            <XIcon className="w-5 h-5 text-red-500" />
            <span>Unlimited rooms</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {(!authenticated ) ? (
           <Button 
           variant="black" className="w-full" 
           onClick={handleSignUp} 
           disabled={signUpLoading}
         >
           {signUpLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
           Sign Up
         </Button>
        ) : (
          !isPremium ? (
            <Button variant="black" className="w-full" disabled>
            Current Plan
          </Button>
          ) : null
        )}
      </CardFooter>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Premium</CardTitle>
        <CardDescription>Unlimited rooms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Unlimited users</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Real-time collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Fully Featured Whiteboard</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>Unlimited rooms</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-between">
        <div className="text-4xl font-bold">$9.99</div>
        <div className="text-sm text-muted-foreground">/month</div>
        {isPremium ? (
          <Button variant="black" className="w-full ml-2" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            variant="black"
            className="w-full ml-2" 
            onClick={handleUpgrade} 
            disabled={upgradeLoading}
          >
            {upgradeLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Upgrade
          </Button>
        )}
      </CardFooter>
    </Card>
  </div>
</div>
</div>
      
    </>
  )
}

export default Pricing;
