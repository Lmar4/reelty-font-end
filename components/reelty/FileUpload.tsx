"use client";

import { useState, useRef } from "react";
import NewListingModal from "./NewListingModal";

interface FileUploadProps {
  buttonText?: string;
  onFilesSelected?: (files: File[]) => void;
}

export default function FileUpload({
  buttonText = "Select listing photos",
}: FileUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 60) {
      alert("You can only upload up to 60 files at once");
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 15 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files are larger than 15MB. Please select smaller files.");
      return;
    }

    setUploadedFiles(files);
    setIsModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 60) {
      alert("You can only upload up to 60 files at once");
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 15 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files are larger than 15MB. Please select smaller files.");
      return;
    }

    setUploadedFiles(files);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Desktop drag & drop interface */}
      <div
        className={`hidden md:flex flex-col items-center justify-center gap-4 bg-gray-50 rounded-2xl border-4 border-dashed ${isDragging ? "border-[#8B5CF6] bg-[#8B5CF6]/5" : "border-gray-200"} p-8 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] transition-all`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Photo icon */}
        <div className='w-16 h-16 flex items-center justify-center'>
          <img
            src='/images/photo_upload_icon.svg'
            alt='Upload photos'
            className='w-14 h-14'
          />
        </div>

        <div className='flex flex-col items-center gap-2'>
          <h3 className='text-xl text-gray-900'>
            Drag your listing photos to start
          </h3>

          <div className='flex items-center gap-3 my-1'>
            <div className='h-[1px] w-20 bg-gray-200'></div>
            <span className='text-gray-500 text-sm'>OR</span>
            <div className='h-[1px] w-20 bg-gray-200'></div>
          </div>

          <button
            className='text-[#8B5CF6] font-bold border-2 border-[#8B5CF6] rounded-full px-6 py-2 hover:bg-[#8B5CF6] hover:text-white transition-colors'
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files
          </button>
        </div>
      </div>

      {/* Mobile upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className='md:hidden w-full bg-black text-white shadow-[0_0_60px_rgba(0,0,0,0.24),0_8px_24px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.12)] rounded-xl p-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all'
      >
        <img
          src='/images/photo_upload_icon.svg'
          alt='Upload photos'
          className='w-7 h-7 brightness-0 invert pointer-events-none'
        />
        <span className='text-lg font-medium pointer-events-none'>
          {buttonText}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*'
        className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none'
        onChange={handleFileUpload}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />

      <NewListingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUploadedFiles([]);
        }}
        initialFiles={uploadedFiles}
      />
    </>
  );
}
