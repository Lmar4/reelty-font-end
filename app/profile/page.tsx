"use client";

import Form from "@/components/common/Form";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import { useUser, useUpdateUser } from "@/hooks/queries/use-user";
import { userProfileSchema, type UserProfileFormData } from "@/schemas/userProfileSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "@/types/prisma-types";

export default function Profile() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { data: userData, isLoading, error } = useUser(currentUser?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUserMutation = useUpdateUser();

  const handleSubmit = async (data: UserProfileFormData) => {
    if (!userData?.id) return;

    try {
      setIsSubmitting(true);
      await updateUserMutation.mutateAsync({
        id: userData.id,
        name: data.name,
        email: data.email,
      });
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
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
            name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
            email: userData?.email || "",
          }}
          className='space-y-6'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-1'>
                Name
              </label>
              <input
                id="name"
                type='text'
                name='name'
                className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='Your name'
                aria-label="Name"
              />
            </div>
            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-1'>
                Email
              </label>
              <input
                id="email"
                type='email'
                name='email'
                className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='your.email@example.com'
                aria-label="Email"
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
