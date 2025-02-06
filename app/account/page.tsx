"use client";
import { useState } from "react";
import DashboardLayout from "@/components/reelty/DashboardLayout";
import ProtectedRoute from "@/components/reelty/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

export default function Account() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-[800px] mx-auto px-4 py-16'>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
            Account
          </h1>

          {/* Email Section */}
          <div className='mb-12'>
            <h2 className='text-[15px] font-medium text-[#1c1c1c] mb-4'>
              Email address
            </h2>
            <div className='flex gap-4 items-start'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='flex-1 px-4 py-2 rounded-lg border text-[15px] text-black outline-none focus:border-[#1c1c1c]'
                disabled={user?.providerData[0]?.providerId === "google.com"}
              />
              <button
                className={`px-6 py-2 rounded-lg text-[14px] font-medium ${
                  user?.providerData[0]?.providerId === "google.com"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-black/90"
                }`}
                disabled={user?.providerData[0]?.providerId === "google.com"}
              >
                Save
              </button>
            </div>
            {user?.providerData[0]?.providerId === "google.com" && (
              <p className='mt-2 text-[13px] text-[#1c1c1c]/60'>
                Your email is managed by Google Sign-In
              </p>
            )}
          </div>

          {/* Email Notifications */}
          <div>
            <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-4'>
              Email notifications
            </h2>
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[15px] font-semibold text-[#1c1c1c]'>
                    Reels ready
                  </div>
                  <div className='text-[14px] text-[#1c1c1c]/60'>
                    Get notified when your Shorts are ready
                  </div>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    aria-label='Reels ready'
                    type='checkbox'
                    className='sr-only peer'
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-[#1c1c1c]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066FF]"></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[15px] font-semibold text-[#1c1c1c]'>
                    Export ready
                  </div>
                  <div className='text-[14px] text-[#1c1c1c]/60'>
                    Get notified when your exports are ready
                  </div>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    aria-label='Export ready'
                    type='checkbox'
                    className='sr-only peer'
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-[#1c1c1c]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066FF]"></div>
                </label>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-[15px] font-semibold text-[#1c1c1c]'>
                    Product updates
                  </div>
                  <div className='text-[14px] text-[#1c1c1c]/60'>
                    Get notified when we release new features
                  </div>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    aria-label='Product updates'
                    type='checkbox'
                    className='sr-only peer'
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-[#1c1c1c]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066FF]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
