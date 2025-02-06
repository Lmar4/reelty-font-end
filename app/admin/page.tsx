import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserStatsSection from "./_components/user-stats-section";
import SystemStatsSection from "./_components/system-stats-section";
import CreditStatsSection from "./_components/credit-stats-section";
import FeatureUsageSection from "./_components/feature-usage-section";

export default function AdminDashboard() {
  return (
    <div className='container mx-auto p-6 space-y-8'>
      <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

      <Tabs defaultValue='users' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='users'>User Statistics</TabsTrigger>
          <TabsTrigger value='system'>System Performance</TabsTrigger>
          <TabsTrigger value='credits'>Credit Usage</TabsTrigger>
          <TabsTrigger value='features'>Feature Usage</TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='mt-6'>
          <Card className='p-6'>
            <UserStatsSection />
          </Card>
        </TabsContent>

        <TabsContent value='system' className='mt-6'>
          <Card className='p-6'>
            <SystemStatsSection />
          </Card>
        </TabsContent>

        <TabsContent value='credits' className='mt-6'>
          <Card className='p-6'>
            <CreditStatsSection />
          </Card>
        </TabsContent>

        <TabsContent value='features' className='mt-6'>
          <Card className='p-6'>
            <FeatureUsageSection />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
