import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionStatusProps {
  status: string;
  tier: string;
  creditsUsed: number;
  activeListings: number;
  totalListings: number;
  onManageSubscription: () => void;
}

export function SubscriptionStatus({
  status,
  tier,
  creditsUsed,
  activeListings,
  totalListings,
  onManageSubscription,
}: SubscriptionStatusProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    trialing: "bg-blue-500",
    canceled: "bg-yellow-500",
    past_due: "bg-red-500",
    inactive: "bg-gray-500",
  };

  const statusMessages: Record<string, string> = {
    active: "Your subscription is active",
    trialing: "Your free trial is active",
    canceled: "Your subscription will end soon",
    past_due: "Payment is past due",
    inactive: "Your subscription is inactive",
  };

  // Default values based on tier
  const tierLimits = {
    free: {
      creditsPerInterval: 10,
      maxActiveListings: 10,
    },
    pro: {
      creditsPerInterval: 50,
      maxActiveListings: 50,
    },
    // Add other tiers as needed
  }[tier] || { creditsPerInterval: 10, maxActiveListings: 10 };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>{tier.toUpperCase()} Plan</CardDescription>
            </div>
            <Badge
              className={statusColors[status] || "bg-gray-500"}
              variant='secondary'
            >
              {status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Usage Stats */}
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between mb-2'>
                <span className='text-sm font-medium'>Credits Used</span>
                <span className='text-sm text-muted-foreground'>
                  {creditsUsed}/{tierLimits.creditsPerInterval}
                </span>
              </div>
              <Progress
                value={(creditsUsed / tierLimits.creditsPerInterval) * 100}
              />
            </div>
            <div>
              <div className='flex justify-between mb-2'>
                <span className='text-sm font-medium'>Active Listings</span>
                <span className='text-sm text-muted-foreground'>
                  {activeListings}/{tierLimits.maxActiveListings}
                </span>
              </div>
              <Progress
                value={(activeListings / tierLimits.maxActiveListings) * 100}
              />
            </div>
          </div>

          {/* Past Due Warning */}
          {status === "past_due" && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Payment Past Due</AlertTitle>
              <AlertDescription>
                Please update your payment method to continue using the service
              </AlertDescription>
            </Alert>
          )}

          {/* Manage Subscription Button */}
          <Button
            className='w-full'
            variant='outline'
            onClick={onManageSubscription}
          >
            <CreditCard className='mr-2 h-4 w-4' />
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
