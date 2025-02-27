import { makeBackendRequest } from "@/utils/withAuth";
import { useBaseQuery } from "./useBaseQuery";
import { ApiResponse } from "@/types/api-types";

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

export interface TemplatesResponse {
  success: boolean;
  data: Template[];
}

async function fetchTemplates(token: string): Promise<TemplatesResponse> {
  const response = await makeBackendRequest<TemplatesResponse>(
    "/api/templates",
    {
      sessionToken: token,
    }
  );
  return response;
}

export function useTemplates() {
  return useBaseQuery<Template[]>(
    ["templates"],
    async (token): Promise<ApiResponse<Template[]>> => {
      const response = await fetchTemplates(token);
      return { success: response.success, data: response.data };
    },
    {
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: false,
    }
  );
}
