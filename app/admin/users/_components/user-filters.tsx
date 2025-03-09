"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
} from "@/constants/subscription-tiers";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    tier: searchParams.get("tier") || "all",
    status: searchParams.get("status") || "all",
    minCredits: searchParams.get("minCredits") || "",
    maxCredits: searchParams.get("maxCredits") || "",
    search: searchParams.get("search") || "",
    lifetimeOnly: searchParams.get("lifetimeOnly") === "true",
    creditStatus: searchParams.get("creditStatus") || "all",
  });

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  // If lifetime only is selected, automatically set tier to LIFETIME
  const handleLifetimeOnlyChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.set("lifetimeOnly", "true");
      params.set("tier", SUBSCRIPTION_TIERS.LIFETIME.id);

      setFilters((prev) => ({
        ...prev,
        lifetimeOnly: true,
        tier: SUBSCRIPTION_TIERS.LIFETIME.id,
      }));
    } else {
      params.delete("lifetimeOnly");

      setFilters((prev) => ({
        ...prev,
        lifetimeOnly: false,
      }));
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow space-y-4'>
      <div className='text-sm font-medium'>Filters</div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        <Select
          value={filters.tier}
          onValueChange={(value) => handleFilterChange("tier", value)}
          disabled={filters.lifetimeOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder='Subscription Tier' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Tiers</SelectItem>
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
              <SelectItem key={key} value={tier.id}>
                {tier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Account Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='ACTIVE'>Active</SelectItem>
            <SelectItem value='CANCELED'>Canceled</SelectItem>
            <SelectItem value='INCOMPLETE'>Incomplete</SelectItem>
            <SelectItem value='INCOMPLETE_EXPIRED'>
              Incomplete Expired
            </SelectItem>
            <SelectItem value='PAST_DUE'>Past Due</SelectItem>
            <SelectItem value='TRIALING'>Trialing</SelectItem>
            <SelectItem value='UNPAID'>Unpaid</SelectItem>
            <SelectItem value='INACTIVE'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type='number'
          placeholder='Min Credits'
          value={filters.minCredits}
          onChange={(e) => handleFilterChange("minCredits", e.target.value)}
          className='w-full'
        />

        <Input
          type='number'
          placeholder='Max Credits'
          value={filters.maxCredits}
          onChange={(e) => handleFilterChange("maxCredits", e.target.value)}
          className='w-full'
        />

        <Input
          type='text'
          placeholder='Search users...'
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className='w-full'
        />
      </div>

      <div className='flex flex-col md:flex-row gap-4 items-start md:items-center'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='lifetimeOnly'
            checked={filters.lifetimeOnly}
            onCheckedChange={handleLifetimeOnlyChange}
          />
          <Label htmlFor='lifetimeOnly' className='font-medium cursor-pointer'>
            Lifetime Plan Subscribers Only
          </Label>
        </div>

        {filters.lifetimeOnly && (
          <div className='flex items-center space-x-2'>
            <Select
              value={filters.creditStatus}
              onValueChange={(value) =>
                handleFilterChange("creditStatus", value)
              }
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Monthly Credit Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Subscribers</SelectItem>
                <SelectItem value='received'>Received This Month</SelectItem>
                <SelectItem value='pending'>Pending This Month</SelectItem>
                <SelectItem value='missed'>Missed Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant='outline'
          onClick={() => {
            setFilters({
              tier: "all",
              status: "all",
              minCredits: "",
              maxCredits: "",
              search: "",
              lifetimeOnly: false,
              creditStatus: "all",
            });
            router.push("?");
          }}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
