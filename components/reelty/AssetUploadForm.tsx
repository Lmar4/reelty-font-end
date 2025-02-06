import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import FileUpload from "@/components/reelty/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface AssetUploadFormProps {
  onSuccess?: () => void;
}

export function AssetUploadForm({ onSuccess }: AssetUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [assetName, setAssetName] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetType, setAssetType] = useState<"MUSIC" | "WATERMARK" | "LOTTIE">(
    "MUSIC"
  );
  const [subscriptionTier, setSubscriptionTier] = useState("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [lottieValidationError, setLottieValidationError] = useState<
    string | null
  >(null);
  const { toast } = useToast();

  const getPresignedUrlMutation = trpc.storage.getPresignedUrl.useMutation();
  const createAssetMutation = trpc.adminPanel.createAsset.useMutation();

  // Validate Lottie file when selected
  const validateLottieFile = async (file: File) => {
    try {
      const json = JSON.parse(await file.text());

      // Check if it's a valid Lottie file
      if (!json.v || !json.ip || !json.op || !json.layers) {
        throw new Error("Invalid Lottie file format");
      }

      // Check dimensions (should be 200x200px or smaller)
      if (json.w > 200 || json.h > 200) {
        throw new Error("Lottie dimensions should be 200x200px or smaller");
      }

      // Check frame rate (should be 24fps)
      if (json.fr !== 24) {
        throw new Error("Lottie frame rate should be 24fps");
      }

      // Check duration (should be 2-3 seconds)
      const duration = (json.op - json.ip) / json.fr;
      if (duration < 2 || duration > 3) {
        throw new Error("Lottie animation should be 2-3 seconds long");
      }

      setLottieValidationError(null);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid Lottie file";
      setLottieValidationError(errorMessage);
      return false;
    }
  };

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (assetType === "LOTTIE") {
      const file = selectedFiles[0];
      const isValid = await validateLottieFile(file);
      if (isValid) {
        setFiles(selectedFiles);
      } else {
        setFiles([]);
      }
    } else {
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !assetName) {
      toast({
        title: "Error",
        description: "Please select a file and enter an asset name",
        variant: "destructive",
      });
      return;
    }

    if (assetType === "LOTTIE" && lottieValidationError) {
      toast({
        title: "Error",
        description: "Please fix the Lottie file validation errors",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const file = files[0];
      const presignedData = await getPresignedUrlMutation.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        type: assetType,
      });

      // Upload to S3
      await fetch(presignedData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Create asset in database
      await createAssetMutation.mutateAsync({
        name: assetName,
        description: assetDescription,
        type: assetType,
        subscriptionTier,
        filePath: presignedData.fileKey,
        isActive: true,
      });

      toast({
        title: "Success",
        description: "Asset uploaded successfully",
      });

      setFiles([]);
      setAssetName("");
      setAssetDescription("");
      setLottieValidationError(null);
      onSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset validation error when changing asset type
  useEffect(() => {
    setLottieValidationError(null);
    setFiles([]);
  }, [assetType]);

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='assetName'>Asset Name</Label>
        <Input
          id='assetName'
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          placeholder='Enter asset name'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='assetDescription'>Description (Optional)</Label>
        <Textarea
          id='assetDescription'
          value={assetDescription}
          onChange={(e) => setAssetDescription(e.target.value)}
          placeholder='Enter asset description'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='assetType'>Asset Type</Label>
        <Select
          value={assetType}
          onValueChange={(value) => setAssetType(value as typeof assetType)}
        >
          <SelectTrigger id='assetType'>
            <SelectValue placeholder='Select asset type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='MUSIC'>Music</SelectItem>
            <SelectItem value='WATERMARK'>Watermark</SelectItem>
            <SelectItem value='LOTTIE'>Lottie Animation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {assetType === "LOTTIE" && (
        <Alert>
          <InfoIcon className='h-4 w-4' />
          <AlertDescription>
            <p className='font-medium mb-2'>Lottie File Requirements:</p>
            <ul className='list-disc list-inside space-y-1 text-sm'>
              <li>Format: JSON file with Lottie animation data</li>
              <li>Dimensions: 200x200px or smaller</li>
              <li>Frame Rate: 24fps</li>
              <li>Duration: 2-3 seconds</li>
              <li>Background: Preferably transparent</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className='space-y-2'>
        <Label htmlFor='subscriptionTier'>Subscription Tier</Label>
        <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
          <SelectTrigger id='subscriptionTier'>
            <SelectValue placeholder='Select subscription tier' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='basic'>Basic</SelectItem>
            <SelectItem value='pro'>Pro</SelectItem>
            <SelectItem value='enterprise'>Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label>File</Label>
        <FileUpload
          onFilesSelected={handleFileSelect}
          maxFiles={1}
          accept={
            assetType === "MUSIC"
              ? "audio/*"
              : assetType === "LOTTIE"
              ? "application/json"
              : "image/*"
          }
        />
        {files.length > 0 && (
          <p className='text-sm text-muted-foreground'>
            Selected: {files[0].name}
          </p>
        )}
        {lottieValidationError && (
          <p className='text-sm text-red-500 mt-1'>{lottieValidationError}</p>
        )}
      </div>

      <Button
        onClick={handleUpload}
        disabled={
          isUploading || !files.length || !assetName || !!lottieValidationError
        }
        className='w-full'
      >
        {isUploading ? "Uploading..." : "Upload Asset"}
      </Button>
    </div>
  );
}
