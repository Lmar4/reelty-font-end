import { JobStatus } from "@/types/job-types";
import {
  CreateVideoJobInput,
  RegenerateVideoInput,
  UpdateVideoJobInput,
} from "@/types/user-types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeBackendRequest } from "@/utils/withAuth";
import { toast } from "sonner";

const JOBS_QUERY_KEY = "jobs";

export const useJobs = (params?: {
  listingId?: string;
  status?: JobStatus;
}) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [JOBS_QUERY_KEY, params],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const searchParams = new URLSearchParams();
      if (params?.listingId) searchParams.append("listingId", params.listingId);
      if (params?.status) searchParams.append("status", params.status);
      return makeBackendRequest<any>(`/api/jobs?${searchParams}`, {
        sessionToken: token,
      });
    },
  });
};

export const useJob = (jobId: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [JOBS_QUERY_KEY, jobId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      return makeBackendRequest<any>(`/api/jobs/${jobId}`, {
        sessionToken: token,
      });
    },
    enabled: !!jobId,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateVideoJobInput) => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      return makeBackendRequest<any>("/api/jobs", {
        method: "POST",
        body: input,
        sessionToken: token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      toast.success("Job created successfully");
    },
    onError: (error) => {
      console.error("[CREATE_JOB_ERROR]", error);
      toast.error("Failed to create job");
    },
  });
};

export const useUpdateJob = (jobId: string) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: UpdateVideoJobInput) => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      return makeBackendRequest<any>(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: input,
        sessionToken: token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      toast.success("Job updated successfully");
    },
    onError: (error) => {
      console.error("[UPDATE_JOB_ERROR]", error);
      toast.error("Failed to update job");
    },
  });
};

export const useDeleteJob = (jobId: string) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await makeBackendRequest<void>(`/api/jobs/${jobId}`, {
        method: "DELETE",
        sessionToken: token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      toast.success("Job deleted successfully");
    },
    onError: (error) => {
      console.error("[DELETE_JOB_ERROR]", error);
      toast.error("Failed to delete job");
    },
  });
};

export const useRegenerateJob = (jobId: string) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: RegenerateVideoInput) => {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      return makeBackendRequest<any>(`/api/jobs/${jobId}/regenerate`, {
        method: "POST",
        body: input,
        sessionToken: token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      toast.success("Job regenerated successfully");
    },
    onError: (error) => {
      console.error("[REGENERATE_JOB_ERROR]", error);
      toast.error("Failed to regenerate job");
    },
  });
};
