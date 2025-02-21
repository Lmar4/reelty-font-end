import { useQuery } from "@tanstack/react-query";
import { makeBackendRequest } from "@/utils/withAuth";
import { Template } from "@/types/prisma-types";
import { useAuth } from "@clerk/nextjs";

async function fetchTemplates(token?: string): Promise<Template[]> {
  if (!token) throw new Error("No token provided");
  return makeBackendRequest<Template[]>("/api/video-templates", {
    sessionToken: token,
  });
}

export function useTemplates(userTier?: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["templates", userTier],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      return fetchTemplates(token);
    },
  });
}
