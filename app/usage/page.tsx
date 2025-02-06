import DashboardLayout from "@/components/reelty/DashboardLayout";
import ProtectedRoute from "@/components/reelty/ProtectedRoute";

export default function Usage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className='max-w-[800px] mx-auto px-4 py-16'>
          <h1 className='text-[32px] font-semibold text-[#1c1c1c] mb-12'>
            Usage
          </h1>

          <div className='text-[15px] text-[#6B7280] mb-12'>
            Reset monthly or yearly (depending on your plan)
          </div>

          {/* Listings Usage */}
          <div>
            <h2 className='text-[22px] font-semibold text-[#1c1c1c] mb-4'>
              Listings
            </h2>
            <div className='relative'>
              {/* Progress Bar Background */}
              <div className='h-2 bg-[#F3F4F6] rounded-full mb-3'>
                {/* Progress Bar Fill */}
                <div
                  className='h-full bg-[#0066FF] rounded-full'
                  style={{ width: "0%" }}
                />
              </div>
              {/* Usage Count */}
              <div className='text-[15px] text-[#6B7280]'>0 / 1</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
