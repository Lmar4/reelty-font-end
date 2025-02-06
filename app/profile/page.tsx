"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import Form from "@/components/common/Form";
import { useToast } from "@/components/common/Toast";
import {
  userProfileSchema,
  type UserProfileFormData,
} from "@/schemas/userProfileSchema";
import { useUserData } from "@/hooks/useUserData";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: userData, isLoading, error } = useUserData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfileMutation = trpc.userProfile.update.useMutation({
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
      router.refresh();
      setIsSubmitting(false);
    },
    onError: (error) => {
      showToast(error.message || "Failed to update profile", "error");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (data: UserProfileFormData) => {
    try {
      setIsSubmitting(true);
      await updateProfileMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
    } catch (error) {
      // Error handled by mutation callbacks
      console.error("Profile update error:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex justify-center items-center min-h-screen'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black'></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className='max-w-[800px] mx-auto px-4 py-16'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-red-600'>
              {error instanceof Error
                ? error.message
                : "Failed to load profile"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='max-w-[800px] mx-auto px-4 py-16'>
        <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
          Profile Settings
        </h1>

        <Form
          schema={userProfileSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            name: userData?.name || "",
            email: userData?.email || "",
          }}
          className='space-y-6'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Name
              </label>
              <input
                type='text'
                name='name'
                className='w-full px-3 py-2 border rounded-md'
                placeholder='Your name'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                type='email'
                name='email'
                className='w-full px-3 py-2 border rounded-md'
                placeholder='your.email@example.com'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Phone
              </label>
              <input
                type='tel'
                name='phone'
                className='w-full px-3 py-2 border rounded-md'
                placeholder='+1 (555) 000-0000'
              />
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Form>
      </div>
    </DashboardLayout>
  );
}
