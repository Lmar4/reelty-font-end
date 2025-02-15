import { useQuery } from "@tanstack/react-query";
import { Template } from "@/types/prisma-types";

async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch(`/api/video-templates`);
  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }
  return response.json();
}

export function useTemplates(userTier?: string) {
  return useQuery({
    queryKey: ["templates", userTier],
    queryFn: () => fetchTemplates(),
  });
}
