"use client"

import StripeProvider from '@/components/StripeProvider';
import Pricing from '@/components/pricing/pricing';

const PricingPage = () => {
  return (
    <StripeProvider>
      <Pricing />
    </StripeProvider>
  );
}

export default PricingPage;