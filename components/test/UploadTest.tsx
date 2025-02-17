"use client";

import { useS3Upload } from "@/hooks/use-s3-upload";
import { useState } from "react";

export default function UploadTest() {
  const uploadToS3 = useS3Upload();
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setStatus("Starting upload...");
    try {
      const files = Array.from(e.target.files);
      const results = await uploadToS3(files, true, (progress) => {
        setProgress(progress);
      });

      setStatus(
        `Upload complete! Results: ${JSON.stringify(results, null, 2)}`
      );
    } catch (error) {
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("Upload error:", error);
    }
  };

  return (
    <div className='p-4 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Upload Test</h1>

      <div className='space-y-4'>
        <input
          type='file'
          onChange={handleFileChange}
          multiple
          className='block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100'
        />

        {progress > 0 && (
          <div className='w-full bg-gray-200 rounded-full h-2.5'>
            <div
              className='bg-blue-600 h-2.5 rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {status && (
          <pre className='bg-gray-50 p-4 rounded-lg overflow-auto max-h-60 text-sm'>
            {status}
          </pre>
        )}
      </div>
    </div>
  );
}
