import { useQuery } from "@tanstack/react-query";

interface Template {
  id: string;
  name: string;
  description: string;
  sequence: any;
  durations: any;
  musicPath?: string;
  musicVolume?: number;
  subscriptionTier: string;
  isActive: boolean;
}

async function fetchTemplates(subscriptionTier: string): Promise<Template[]> {
  const response = await fetch(`/api/templates?tierId=${subscriptionTier}`);
  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }
  return response.json();
}

export function useTemplates(subscriptionTier: string) {
  return useQuery({
    queryKey: ["templates", subscriptionTier],
    queryFn: () => fetchTemplates(subscriptionTier),
    enabled: !!subscriptionTier,
  });
}
