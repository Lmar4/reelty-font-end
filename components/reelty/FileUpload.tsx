"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  buttonText?: string;
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  uploadUrl?: string;
  disabled?: boolean;
}

export default function FileUpload({
  buttonText = "Select listing photos",
  onFilesSelected,
  accept = "image/*",
  maxFiles = 60,
  maxSize = 15, // 15MB default
  uploadUrl,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): boolean => {
    // Check number of files
    if (files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files at once`);
      return false;
    }

    // Check file sizes
    const oversizedFiles = files.filter(
      (file) => file.size > maxSize * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast.error(
        `Some files are larger than ${maxSize}MB. Please select smaller files.`
      );
      return false;
    }

    // Check file types
    const allowedTypes = accept.split(",").map((type) => type.trim());
    const invalidFiles = files.filter((file) => {
      if (accept === "image/*") {
        return !file.type.startsWith("image/");
      }
      return !allowedTypes.some((type) => file.name.endsWith(type));
    });

    if (invalidFiles.length > 0) {
      toast.error("Invalid file type. Please select only image files.");
      return false;
    }

    return true;
  };

  const uploadFiles = async (files: File[]) => {
    // If no uploadUrl is provided, just call onFilesSelected
    if (!uploadUrl?.trim()) {
      onFilesSelected(files);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Extract listingId from URL
      const listingId = uploadUrl.split("/").pop();

      // Validate listing ID
      if (!listingId || listingId === "undefined") {
        throw new Error("Invalid listing ID");
      }

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadProgress(100);
      toast.success("Files uploaded successfully");
      onFilesSelected(files);
    } catch (error) {
      toast.error(
        `Error uploading files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    onFilesSelected(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (!validateFiles(files)) return;

    try {
      await uploadFiles(files);
    } catch (error) {
      // If upload fails, don't call onFilesSelected
      console.error("Upload failed:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
      fileInputRef.current?.focus();
    }
  };

  return (
    <div className='space-y-4'>
      {/* Desktop drag & drop interface */}
      <div
        data-testid='dropzone'
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-label='Drop files here or click to select'
        aria-disabled={disabled}
        className={`hidden md:flex flex-col items-center justify-center gap-4 bg-gray-50 rounded-2xl border-4 border-dashed ${
          isDragging ? "border-[#8B5CF6]" : "border-gray-200"
        } p-8 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={
          disabled
            ? undefined
            : () => {
                fileInputRef.current?.click();
                fileInputRef.current?.focus();
              }
        }
        onKeyDown={disabled ? undefined : handleKeyDown}
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

          <div
            className='text-[#8B5CF6] font-bold border-2 border-[#8B5CF6] rounded-full px-6 py-2 hover:bg-[#8B5CF6] hover:text-white transition-colors cursor-pointer'
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
              fileInputRef.current?.focus();
            }}
          >
            Browse files
          </div>
        </div>
      </div>

      {/* Mobile upload button */}
      <button
        onClick={() => !disabled && fileInputRef.current?.click()}
        disabled={disabled}
        className={`md:hidden w-full bg-black text-white shadow-[0_0_60px_rgba(0,0,0,0.24),0_8px_24px_rgba(0,0,0,0.16),0_2px_8px_rgba(0,0,0,0.12)] rounded-xl p-4 flex items-center justify-center gap-3 ${
          disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"
        } transition-all`}
      >
        <img
          src='/images/photo_upload_icon.svg'
          alt='Upload photos'
          className='w-7 h-7 brightness-0 invert pointer-events-none'
        />
        <span className='text-lg font-bold pointer-events-none'>
          {buttonText}
        </span>
      </button>

      {/* Upload progress */}
      {isUploading && (
        <div className='space-y-2'>
          <Progress value={uploadProgress} className='h-2' />
          <p className='text-sm text-gray-500 text-center'>
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type='file'
        multiple
        accept={accept}
        data-testid='file-input'
        aria-label='File input'
        className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none'
        onChange={handleFileChange}
        onClick={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />
    </div>
  );
}
