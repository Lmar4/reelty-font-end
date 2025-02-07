import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  CreateVideoJobInput,
  GetVideoJobsParams,
  RegenerateVideoInput,
  UpdateVideoJobInput,
  VideoJob,
} from "@/types/user-types";

const JOBS_QUERY_KEY = "jobs";

export const useJobs = (params?: GetVideoJobsParams) => {
  return useQuery({
    queryKey: [JOBS_QUERY_KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.listingId) {
        searchParams.append("listingId", params.listingId);
      }
      if (params?.status) {
        searchParams.append("status", params.status);
      }

      const { data } = await axios.get<VideoJob[]>(`/api/jobs?${searchParams}`);
      return data;
    },
  });
};

export const useJob = (jobId: string) => {
  return useQuery({
    queryKey: [JOBS_QUERY_KEY, jobId],
    queryFn: async () => {
      const { data } = await axios.get<VideoJob>(`/api/jobs/${jobId}`);
      return data;
    },
    enabled: !!jobId,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVideoJobInput) => {
      const { data } = await axios.post<VideoJob>("/api/jobs", input);
      return data;
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

  return useMutation({
    mutationFn: async (input: UpdateVideoJobInput) => {
      const { data } = await axios.patch<VideoJob>(`/api/jobs/${jobId}`, input);
      return data;
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

  return useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/jobs/${jobId}`);
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

  return useMutation({
    mutationFn: async (input: RegenerateVideoInput) => {
      const { data } = await axios.post<VideoJob>(
        `/api/jobs/${jobId}/regenerate`,
        input
      );
      return data;
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
