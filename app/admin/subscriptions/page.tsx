"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { SubscriptionTiersSection } from "./_components/subscription-tiers-section";
import { BulkDiscountsSection } from "./_components/bulk-discounts-section";
import { AgencyManagementSection } from "./_components/agency-management-section";

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("tiers");

  return (
    <div className='container mx-auto py-6 max-w-[1200px]'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Subscription Management
        </h1>
        <p className='text-muted-foreground mt-2'>
          Manage subscription tiers, bulk discounts, and agency accounts.
        </p>
      </div>

      <Tabs
        defaultValue='tiers'
        className='space-y-6'
        onValueChange={setActiveTab}
      >
        <TabsList className='grid w-full grid-cols-3 lg:w-[400px]'>
          <TabsTrigger value='tiers'>Subscription Tiers</TabsTrigger>
          <TabsTrigger value='discounts'>Bulk Discounts</TabsTrigger>
          <TabsTrigger value='agencies'>Agencies</TabsTrigger>
        </TabsList>

        <div className='grid gap-6'>
          <TabsContent value='tiers' className='space-y-4'>
            <Card className='p-6'>
              <SubscriptionTiersSection />
            </Card>
          </TabsContent>

          <TabsContent value='discounts' className='space-y-4'>
            <Card className='p-6'>
              <BulkDiscountsSection />
            </Card>
          </TabsContent>

          <TabsContent value='agencies' className='space-y-4'>
            <Card className='p-6'>
              <AgencyManagementSection />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
