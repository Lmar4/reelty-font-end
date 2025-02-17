import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureName =
  | "Credits"
  | "Active Listings"
  | "Photos per Listing"
  | "Premium Templates";

interface TierFeatures {
  name: string;
  features: Record<
    FeatureName,
    {
      included: boolean;
      value?: string | number;
    }
  >;
}

interface TierComparisonTableProps {
  features: Array<{
    name: string;
    description: string;
  }>;
  tiers: TierFeatures[];
  currentTierId?: string;
}

export function TierComparisonTable({
  features,
  tiers,
  currentTierId,
}: TierComparisonTableProps) {
  return (
    <div className='w-full overflow-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[200px]'>Features</TableHead>
            {tiers.map((tier) => (
              <TableHead
                key={tier.name}
                className={cn(
                  "text-center min-w-[140px]",
                  tier.name === currentTierId && "bg-muted"
                )}
              >
                <div className='font-bold'>{tier.name}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.name}>
              <TableCell className='font-medium'>
                {feature.name}
                {feature.description && (
                  <div className='text-sm text-muted-foreground'>
                    {feature.description}
                  </div>
                )}
              </TableCell>
              {tiers.map((tier) => {
                const tierFeature = tier.features[feature.name as FeatureName];
                return (
                  <TableCell
                    key={`${tier.name}-${feature.name}`}
                    className='text-center'
                  >
                    {tierFeature.value ? (
                      <span className='font-medium'>{tierFeature.value}</span>
                    ) : tierFeature.included ? (
                      <Check className='h-4 w-4 text-primary mx-auto' />
                    ) : (
                      <X className='h-4 w-4 text-muted-foreground mx-auto' />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
