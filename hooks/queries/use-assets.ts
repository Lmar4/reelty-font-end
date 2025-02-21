"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeBackendRequest } from "@/utils/withAuth";
import type {
  Asset,
  CreateAssetInput,
  GetAssetsParams,
  UpdateAssetInput,
} from "@/types/asset-types";
import { useAuth } from "@clerk/nextjs";

const ASSETS_QUERY_KEY = "assets";

interface UseAssetsOptions extends GetAssetsParams {
  initialData?: Asset[];
}

async function getAssets(
  params?: GetAssetsParams,
  token?: string
): Promise<Asset[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.includeInactive !== undefined)
    searchParams.set("includeInactive", String(params.includeInactive));

  if (!token) {
    throw new Error("Authentication token is required");
  }

  return makeBackendRequest<Asset[]>(
    `/api/admin/assets?${searchParams.toString()}`,
    {
      sessionToken: token,
    }
  );
}

async function createAsset(
  input: CreateAssetInput,
  token?: string
): Promise<Asset> {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  return makeBackendRequest<Asset>("/api/admin/assets", {
    method: "POST",
    body: input,
    sessionToken: token,
  });
}

async function updateAsset(
  input: UpdateAssetInput,
  token?: string
): Promise<Asset> {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  return makeBackendRequest<Asset>(`/api/admin/assets/${input.id}`, {
    method: "PATCH",
    body: input,
    sessionToken: token,
  });
}

async function deleteAsset(id: string, token?: string): Promise<void> {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  await makeBackendRequest<void>(`/api/admin/assets/${id}`, {
    method: "DELETE",
    sessionToken: token,
  });
}

export function useAssets(options?: UseAssetsOptions) {
  const { initialData, ...params } = options ?? {};
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, params],
    queryFn: async () => {
      const token = await getToken();
      return getAssets(params, token || undefined);
    },
    initialData,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAssetInput) => {
      const token = await getToken();
      return createAsset(input, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateAssetInput) => {
      const token = await getToken();
      return updateAsset(input, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteAsset(id, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
    },
  });
}
