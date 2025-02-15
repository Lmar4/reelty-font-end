import {
  CreateVideoJobInput,
  GetVideoJobsParams,
  RegenerateVideoInput,
  UpdateVideoJobInput,
} from "@/types/user-types";
import { JobStatus } from "@/types/job-types";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      const searchParams = new URLSearchParams();
      if (params?.listingId) {
        searchParams.append("listingId", params.listingId);
      }
      if (params?.status) {
        searchParams.append("status", params.status);
      }

      const response = await fetch(`/api/jobs?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      return response.json();
    },
  });
};

export const useJob = (jobId: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: [JOBS_QUERY_KEY, jobId],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }

      return response.json();
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
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create job");
      }

      return response.json();
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
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Failed to update job");
      }

      return response.json();
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
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
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
      const response = await fetch(`/api/jobs/${jobId}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate job");
      }

      return response.json();
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
