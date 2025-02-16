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
  status:
    | "ACTIVE"
    | "CANCELED"
    | "INCOMPLETE"
    | "INCOMPLETE_EXPIRED"
    | "PAST_DUE"
    | "TRIALING"
    | "UNPAID"
    | "INACTIVE";
  tier: {
    name: string;
    creditsPerInterval: number;
    maxActiveListings: number;
    maxPhotosPerListing: number;
  };
  creditsUsed: number;
  activeListings: number;
  periodEnd?: Date;
  onManageSubscription: () => void;
}

export function SubscriptionStatus({
  status,
  tier,
  creditsUsed,
  activeListings,
  periodEnd,
  onManageSubscription,
}: SubscriptionStatusProps) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    TRIALING: "bg-blue-500",
    CANCELED: "bg-yellow-500",
    PAST_DUE: "bg-red-500",
    INACTIVE: "bg-gray-500",
  };

  const statusMessages: Record<string, string> = {
    ACTIVE: "Your subscription is active",
    TRIALING: "Your free trial is active",
    CANCELED: "Your subscription will end soon",
    PAST_DUE: "Payment is past due",
    INACTIVE: "Your subscription is inactive",
  };

  const creditsRemaining = tier.creditsPerInterval - creditsUsed;
  const listingsRemaining = tier.maxActiveListings - activeListings;

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>{tier.name} Plan</CardDescription>
            </div>
            <Badge className={statusColors[status]} variant='secondary'>
              {status}
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
                  {creditsUsed}/{tier.creditsPerInterval}
                </span>
              </div>
              <Progress value={(creditsUsed / tier.creditsPerInterval) * 100} />
            </div>
            <div>
              <div className='flex justify-between mb-2'>
                <span className='text-sm font-medium'>Active Listings</span>
                <span className='text-sm text-muted-foreground'>
                  {activeListings}/{tier.maxActiveListings}
                </span>
              </div>
              <Progress
                value={(activeListings / tier.maxActiveListings) * 100}
              />
            </div>
          </div>

          {/* Period End Warning */}
          {status === "CANCELED" && periodEnd && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Subscription Ending</AlertTitle>
              <AlertDescription>
                Your subscription will end on {periodEnd.toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Past Due Warning */}
          {status === "PAST_DUE" && (
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
