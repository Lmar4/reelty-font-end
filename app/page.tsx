"use client";

import FileUpload from "@/components/reelty/FileUpload";
import Footer from "@/components/reelty/Footer";
import HomeHeader from "@/components/reelty/HomeHeader";
import NewListingModal from "@/components/reelty/NewListingModal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const router = useRouter();
  const { userId } = useAuth();

  const handleFilesSelected = (files: File[]) => {
    // If user is not authenticated, redirect to sign up
    if (!userId) {
      router.push(
        "/sign-up?message=Please sign up first to have your own reels"
      );
      return;
    }

    // Regular file handling for authenticated users
    const filesToUse = files.slice(0, 10);
    if (files.length > 10) {
      toast.info(
        `Selected the first 10 photos out of ${files.length} uploaded`
      );
    }

    setSelectedFiles(filesToUse);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFiles([]);
  };

  return (
    <div className='min-h-screen bg-white flex flex-col overflow-x-hidden'>
      <HomeHeader />

      {/* Main Content */}
      <main className='max-w-[1200px] mx-auto px-6 pt-[84px] md:pt-[72px] text-center flex-grow'>
        <div className='inline-flex items-center gap-2 mb-1 md:mb-2 bg-gray-100 px-3 py-1.5 rounded-full mt-8 md:mt-16'>
          <div className='flex -space-x-1.5'>
            <div className='w-6 h-6 rounded-full overflow-hidden border-2 border-white'>
              <Image
                src='/images/profiles/profile1.png'
                alt='Profile 1'
                width={24}
                height={24}
                className='object-cover w-full h-full'
              />
            </div>
            <div className='w-6 h-6 rounded-full overflow-hidden border-2 border-white'>
              <Image
                src='/images/profiles/profile2.png'
                alt='Profile 2'
                width={24}
                height={24}
                className='object-cover w-full h-full'
              />
            </div>
            <div className='w-6 h-6 rounded-full overflow-hidden border-2 border-white'>
              <Image
                src='/images/profiles/profile3.png'
                alt='Profile 3'
                width={24}
                height={24}
                className='object-cover w-full h-full'
              />
            </div>
          </div>
          <p className='text-[15px] text-[#1c1c1c]'>
            Coming soon to{" "}
            <span className='font-semibold'>150k+ happy users</span>
          </p>
        </div>

        {/* Hero Section */}
        <h1 className='text-[58px] md:text-[80px] leading-[1.15] md:leading-[0.95] font-black tracking-[-0.03em] mb-6 md:mb-8 text-[#1c1c1c] pt-4 md:pt-8'>
          {/* Mobile layout */}
          <div className='flex flex-col md:hidden'>
            <div className='mb-3'>Turn listings</div>
            <div className='mb-3 flex items-center justify-center'>
              <div className='w-[100px] h-[60px] rounded-md bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden mr-4'>
                <div className='grid grid-cols-2 gap-1 p-1 h-full'>
                  <div className='relative rounded-[4px] overflow-hidden w-full h-full'>
                    <Image
                      src='/images/hero/listing1.webp'
                      alt='Listing photo 1'
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='relative rounded-[4px] overflow-hidden w-full h-full'>
                    <Image
                      src='/images/hero/listing2.webp'
                      alt='Listing photo 2'
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='relative rounded-[4px] overflow-hidden w-full h-full'>
                    <Image
                      src='/images/hero/listing3.webp'
                      alt='Listing photo 3'
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='relative rounded-[4px] overflow-hidden w-full h-full'>
                    <Image
                      src='/images/hero/listing4.webp'
                      alt='Listing photo 4'
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
              </div>
              into
            </div>
            <div className='flex items-center justify-center'>
              <span className='mr-2'>viral</span>
              <div className='w-[65px] flex items-center justify-center'>
                <div className='relative'>
                  {/* Background rectangles */}
                  <div className='absolute -right-3 -bottom-3 w-[45px] h-[80px] rounded-lg bg-gray-200 rotate-6'></div>
                  <div className='absolute -right-1.5 -bottom-1.5 w-[45px] h-[80px] rounded-lg bg-gray-300 rotate-3'></div>
                  {/* Main reel container */}
                  <div className='relative w-[45px] h-[80px] rounded-lg bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden'>
                    <div className='relative w-full h-full'>
                      <Image
                        src='/images/hero/reel.gif'
                        alt='Real estate reel'
                        fill
                        className='object-cover'
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </div>
              <span className='text-[#8B5CF6] ml-4'>Reels</span>
            </div>
          </div>

          {/* Desktop layout */}
          <div className='hidden md:block'>
            <div className='mb-0'>
              Turn listings
              <span className='inline-flex mx-4 align-middle'>
                <div className='w-[160px] h-[100px] rounded-lg bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden'>
                  <div className='grid grid-cols-2 gap-1 p-1 h-full'>
                    <div className='relative rounded-lg overflow-hidden w-full h-full'>
                      <Image
                        src='/images/hero/listing1.webp'
                        alt='Listing photo 1'
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='relative rounded-lg overflow-hidden w-full h-full'>
                      <Image
                        src='/images/hero/listing2.webp'
                        alt='Listing photo 2'
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='relative rounded-lg overflow-hidden w-full h-full'>
                      <Image
                        src='/images/hero/listing3.webp'
                        alt='Listing photo 3'
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='relative rounded-lg overflow-hidden w-full h-full'>
                      <Image
                        src='/images/hero/listing4.webp'
                        alt='Listing photo 4'
                        fill
                        className='object-cover'
                      />
                    </div>
                  </div>
                </div>
              </span>
              into
            </div>
            <div>
              <span className='mr-4'>viral</span>
              <div className='inline-flex align-middle w-[100px] justify-center'>
                <div className='relative'>
                  {/* Background rectangles */}
                  <div className='absolute -right-4 -bottom-4 w-[78.75px] h-[140px] rounded-lg bg-gray-200 rotate-6'></div>
                  <div className='absolute -right-2 -bottom-2 w-[78.75px] h-[140px] rounded-lg bg-gray-300 rotate-3'></div>
                  {/* Main reel container */}
                  <div className='relative w-[78.75px] h-[140px] rounded-lg bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden'>
                    <div className='relative w-full h-full'>
                      <Image
                        src='/images/hero/reel.gif'
                        alt='Real estate reel'
                        fill
                        className='object-cover'
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </div>
              <span className='text-[#8B5CF6] ml-6'>Reels</span>
            </div>
          </div>
        </h1>

        {/* Input Section */}
        <div className='max-w-[800px] mx-auto px-4'>
          <FileUpload
            buttonText={"Select listing photos"}
            onFilesSelected={handleFilesSelected}
            uploadUrl='' // Keep empty for new listings
            maxFiles={10}
            maxSize={15}
            accept='image/*'
          />
          <p className='text-[16px] text-[#9CA3AF] mt-3 md:mt-8 mb-24 md:mb-12 text-center'>
            Try for free. No credit card required.
          </p>
        </div>
      </main>

      {/* New Listing Modal */}
      <NewListingModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialFiles={selectedFiles}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
