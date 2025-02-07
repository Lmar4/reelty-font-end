"use client";

import DashboardLayout from "@/components/reelty/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListings } from "@/hooks/queries/use-listings";
import { useSubscriptionTiers } from "@/hooks/queries/use-subscription";
import { useJobs } from "@/hooks/use-jobs";
import { useUserData } from "@/hooks/useUserData";
import { Calendar, CreditCard, Film, ListVideo, Settings } from "lucide-react";
import { motion } from "framer-motion";

const SettingsSkeleton = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Profile Information Skeleton */}
      <Card className='p-6'>
        <Skeleton className='h-8 w-48 mb-6' />
        <div className='space-y-6'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-6 w-full' />
            </div>
          ))}
        </div>
      </Card>

      {/* Subscription Information Skeleton */}
      <Card className='p-6'>
        <Skeleton className='h-8 w-48 mb-6' />
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-6 w-3/4' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-4 w-full mt-2' />
            ))}
          </div>
          <Skeleton className='h-10 w-full' />
        </div>
      </Card>

      {/* Statistics Skeleton */}
      <Card className='p-6 md:col-span-2'>
        <Skeleton className='h-8 w-48 mb-6' />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-12 w-12 rounded-lg' />
              <div>
                <Skeleton className='h-8 w-16 mb-1' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default function SettingsPage() {
  const { data: userData, isLoading: isUserLoading } = useUserData();
  const { data: subscriptionTiers, isLoading: isSubscriptionLoading } =
    useSubscriptionTiers();
  const { data: listings } = useListings(userData?.id || "");
  const { data: jobs } = useJobs({ status: "completed" });

  const currentTier = subscriptionTiers?.find(
    (tier) => tier.id === userData?.subscriptionTier
  );

  const isLoading = isUserLoading || isSubscriptionLoading;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <DashboardLayout>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-16'>
        {/* Header Section */}
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className='text-[32px] font-semibold text-[#1c1c1c] flex items-center gap-2'>
            <Settings className='w-8 h-8' />
            Account Settings
          </h1>
          <p className='text-[#1c1c1c]/60'>
            Manage your account settings and subscription
          </p>
        </motion.div>

        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='grid grid-cols-1 md:grid-cols-2 gap-6'
          >
            {/* Profile Information */}
            <motion.div variants={item}>
              <Card className='p-6'>
                <h2 className='text-xl font-semibold mb-4'>
                  Profile Information
                </h2>
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm text-[#1c1c1c]/60'>Name</label>
                    <p className='text-[#1c1c1c]'>{userData?.name}</p>
                  </div>
                  <div>
                    <label className='text-sm text-[#1c1c1c]/60'>Email</label>
                    <p className='text-[#1c1c1c]'>{userData?.email}</p>
                  </div>
                  <div>
                    <label className='text-sm text-[#1c1c1c]/60'>
                      Member Since
                    </label>
                    <p className='text-[#1c1c1c]'>
                      {new Date(userData?.createdAt || "").toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm text-[#1c1c1c]/60'>
                      Last Login
                    </label>
                    <p className='text-[#1c1c1c]'>
                      {userData?.lastLoginAt
                        ? new Date(userData.lastLoginAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Subscription Information */}
            <motion.div variants={item}>
              <Card className='p-6'>
                <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                  <CreditCard className='w-5 h-5' />
                  Subscription
                </h2>
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm text-[#1c1c1c]/60'>
                      Current Plan
                    </label>
                    <div className='flex items-center gap-2'>
                      <p className='text-[#1c1c1c] font-medium'>
                        {currentTier?.description || "Free"}
                      </p>
                      <Badge variant='secondary'>Active</Badge>
                    </div>
                  </div>
                  <div>
                    <label className='text-sm text-[#1c1c1c]/60'>
                      Features
                    </label>
                    <ul className='list-disc list-inside text-[#1c1c1c] space-y-1'>
                      {currentTier?.features?.map(
                        (feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <Button variant='outline' className='w-full'>
                    Manage Subscription
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Usage Statistics */}
            <motion.div variants={item} className='md:col-span-2'>
              <Card className='p-6'>
                <h2 className='text-xl font-semibold mb-4'>
                  Account Statistics
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 p-3 rounded-lg'>
                      <ListVideo className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                      <p className='text-2xl font-semibold'>
                        {listings?.length || 0}
                      </p>
                      <p className='text-sm text-[#1c1c1c]/60'>
                        Total Listings
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 p-3 rounded-lg'>
                      <Film className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                      <p className='text-2xl font-semibold'>
                        {jobs?.length || 0}
                      </p>
                      <p className='text-sm text-[#1c1c1c]/60'>
                        Generated Videos
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 p-3 rounded-lg'>
                      <Calendar className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                      <p className='text-2xl font-semibold'>
                        {Math.floor(
                          (new Date().getTime() -
                            new Date(userData?.createdAt || "").getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </p>
                      <p className='text-sm text-[#1c1c1c]/60'>
                        Days as Member
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
