"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TemplateManagementSection } from "./_components/template-management-section";
import { AssetManagementSection } from "./_components/asset-management-section";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className='container mx-auto py-6 max-w-[1200px]'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>System Settings</h1>
        <p className='text-muted-foreground mt-2'>
          Manage templates, assets, and system configuration.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='mb-4'>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
          <TabsTrigger value='assets'>Assets</TabsTrigger>
        </TabsList>

        <TabsContent value='templates'>
          <Card>
            <TemplateManagementSection />
          </Card>
        </TabsContent>

        <TabsContent value='assets'>
          <Card>
            <AssetManagementSection />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
