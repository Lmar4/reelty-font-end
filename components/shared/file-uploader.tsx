"use client";

import FileUpload from "@/components/reelty/FileUpload";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUploader({
  onFileSelect,
  accept,
  maxSize = 10, // 10MB default
}: FileUploaderProps) {
  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <FileUpload
      buttonText='Click or drag file to upload'
      onFilesSelected={handleFilesSelected}
      accept={accept}
      maxFiles={1}
      maxSize={maxSize}
    />
  );
}
