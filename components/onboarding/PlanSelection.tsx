import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export type Plan = {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripePriceId: string;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "Basic listing management",
      "Limited analytics",
      "Email support",
    ],
    stripePriceId: "",
  },
  {
    id: "base",
    name: "Base",
    price: 29,
    features: [
      "Advanced listing management",
      "Full analytics",
      "Priority support",
      "Custom branding",
    ],
    stripePriceId: "price_base",
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    features: [
      "Everything in Base",
      "API access",
      "24/7 phone support",
      "Advanced integrations",
    ],
    stripePriceId: "price_pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom development",
      "SLA guarantee",
    ],
    stripePriceId: "price_enterprise",
  },
];

interface PlanSelectionProps {
  onSelect: () => void;
}

export default function PlanSelection({ onSelect }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("free");

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan.id);

    if (plan.price === 0) {
      // For free plan, just proceed
      onSelect();
      return;
    }

    // For paid plans, redirect to Stripe
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          planId: plan.id,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => handlePlanSelect(plan)}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handlePlanSelect(plan);
            }
          }}
          aria-label={`Select ${plan.name} plan`}
        >
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>{plan.name}</h3>
              {selectedPlan === plan.id && (
                <Check className='w-5 h-5 text-blue-500' />
              )}
            </div>

            <p className='text-2xl font-bold'>
              ${plan.price}
              <span className='text-sm font-normal text-gray-500'>/month</span>
            </p>

            <ul className='space-y-2'>
              {plan.features.map((feature, index) => (
                <li key={index} className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-green-500' />
                  <span className='text-sm'>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={selectedPlan === plan.id ? "default" : "outline"}
              className='w-full'
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.price === 0 ? "Get Started" : "Subscribe Now"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
