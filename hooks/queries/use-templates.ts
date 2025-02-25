import { makeBackendRequest } from "@/utils/withAuth";
import { useBaseQuery } from "./useBaseQuery";

export interface Template {
  id: string;
  name: string;
  description: string;
  key: string;
  tiers: string[];
  order: number;
  sequence: Record<string, unknown>;
  durations: Record<string, unknown>;
  thumbnailUrl?: string | null;
}

async function fetchTemplates(token: string): Promise<Template[]> {
  return makeBackendRequest<Template[]>("/api/templates", {
    sessionToken: token,
  });
}

export function useTemplates() {
  return useBaseQuery<Template[]>(
    ["templates"],
    (token) => fetchTemplates(token),
    {
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}
