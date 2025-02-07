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
import { SUBSCRIPTION_TIERS } from "@/constants/subscription-tiers";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    tier: searchParams.get("tier") || "",
    status: searchParams.get("status") || "",
    minCredits: searchParams.get("minCredits") || "",
    maxCredits: searchParams.get("maxCredits") || "",
    search: searchParams.get("search") || "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
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
        >
          <SelectTrigger>
            <SelectValue placeholder='Subscription Tier' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>All Tiers</SelectItem>
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
            <SelectItem value=''>All Statuses</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='suspended'>Suspended</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
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

      <Button
        variant='outline'
        onClick={() => {
          setFilters({
            tier: "",
            status: "",
            minCredits: "",
            maxCredits: "",
            search: "",
          });
          router.push("?");
        }}
      >
        Clear Filters
      </Button>
    </div>
  );
}
