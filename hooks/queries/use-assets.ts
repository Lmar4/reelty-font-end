"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Asset,
  CreateAssetInput,
  GetAssetsParams,
  UpdateAssetInput,
} from "@/types/asset-types";

const ASSETS_QUERY_KEY = "assets";

interface UseAssetsOptions extends GetAssetsParams {
  initialData?: Asset[];
}

async function getAssets(params?: GetAssetsParams): Promise<Asset[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set("type", params.type);
  if (params?.includeInactive !== undefined)
    searchParams.set("includeInactive", String(params.includeInactive));

  const response = await fetch(`/api/admin/assets?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch assets");
  }
  return response.json();
}

async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const response = await fetch("/api/admin/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to create asset");
  }
  return response.json();
}

async function updateAsset(input: UpdateAssetInput): Promise<Asset> {
  const response = await fetch(`/api/admin/assets/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error("Failed to update asset");
  }
  return response.json();
}

async function deleteAsset(id: string): Promise<void> {
  const response = await fetch(`/api/admin/assets/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete asset");
  }
}

export function useAssets(options?: UseAssetsOptions) {
  const { initialData, ...params } = options ?? {};

  return useQuery({
    queryKey: [ASSETS_QUERY_KEY, params],
    queryFn: () => getAssets(params),
    initialData,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
    },
  });
}
