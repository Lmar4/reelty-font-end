import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionTierCardProps {
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function SubscriptionTierCard({
  name,
  description,
  price,
  features,
  isPopular,
  isCurrentPlan,
  onSelect,
  disabled,
}: SubscriptionTierCardProps) {
  return (
    <Card
      className={cn(
        "relative w-full max-w-sm rounded-xl border",
        isPopular && "border-primary shadow-lg",
        isCurrentPlan && "bg-muted"
      )}
    >
      {isPopular && (
        <Badge variant='default' className='absolute -top-2 right-4'>
          Most Popular
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge variant='outline' className='absolute -top-2 right-4'>
          Current Plan
        </Badge>
      )}
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>{name}</CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-6'>
          <span className='text-4xl font-bold'>${price}</span>
          <span className='text-muted-foreground'>/month</span>
        </div>
        <ul className='space-y-2'>
          {features.map((feature, index) => (
            <li key={index} className='flex items-center gap-2'>
              <Check className='h-4 w-4 text-primary' />
              <span className='text-sm'>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className='w-full'
          variant={isPopular ? "default" : "outline"}
          onClick={onSelect}
          disabled={disabled || isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
