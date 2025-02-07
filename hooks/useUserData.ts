import { trpc } from "@/lib/trpc";
import { useUser } from "@clerk/nextjs";

export function useUserData() {
  const { user, isLoaded } = useUser();

  const query = trpc.user.getUser.useQuery(
    { id: user?.id || "" },
    { 
      enabled: isLoaded && !!user?.id,
      // Keep previous data while fetching new data
      keepPreviousData: true,
      // Refetch when user data changes
      refetchOnWindowFocus: true,
    }
  );

  return {
    ...query,
    // Add isLoaded from Clerk to help components handle the initial loading state
    isLoading: !isLoaded || query.isLoading,
    // Ensure user is loaded before returning data
    data: isLoaded ? query.data : undefined
  };
}
