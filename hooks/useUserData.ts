import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useAuth } from "./useAuth";

export function useUserData() {
  const { user } = useAuth();

  return trpc.user.getUser.useQuery(
    { id: user?.uid || "" },
    { enabled: !!user?.uid }
  );
}
