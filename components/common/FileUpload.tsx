import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept,
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept ? { [accept]: [] } : undefined,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className='text-center'>
        <p className='text-sm text-muted-foreground'>
          {isDragActive
            ? "Drop the files here..."
            : "Drag and drop files here, or click to select files"}
        </p>
        {maxFiles === 1 ? (
          <p className='text-xs text-muted-foreground mt-1'>
            Maximum 1 file allowed
          </p>
        ) : (
          <p className='text-xs text-muted-foreground mt-1'>
            Maximum {maxFiles} files allowed
          </p>
        )}
        {maxSize && (
          <p className='text-xs text-muted-foreground mt-1'>
            Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        )}
        {accept && (
          <p className='text-xs text-muted-foreground mt-1'>
            Accepted file types: {accept}
          </p>
        )}
      </div>
    </div>
  );
}
