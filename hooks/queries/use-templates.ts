import { useQuery } from "@tanstack/react-query";
import { makeBackendRequest } from "@/utils/withAuth";
import { useAuth } from "@clerk/nextjs";

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

async function fetchTemplates(token?: string): Promise<Template[]> {
  if (!token) throw new Error("No token provided");
  return makeBackendRequest<Template[]>("/api/templates", {
    sessionToken: token,
  });
}

export function useTemplates() {
  const { getToken } = useAuth();

  return useQuery<Template[], Error>({
    queryKey: ["templates"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      return fetchTemplates(token);
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
}
