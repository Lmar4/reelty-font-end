import { useState } from "react";
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
  const { toast } = useToast();

  const getPresignedUrlMutation = trpc.storage.getPresignedUrl.useMutation();
  const createAssetMutation = trpc.admin.createAsset.useMutation();

  const handleUpload = async () => {
    if (!files.length || !assetName) {
      toast({
        title: "Error",
        description: "Please select a file and enter an asset name",
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
          onFilesSelected={setFiles}
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
      </div>

      <Button
        onClick={handleUpload}
        disabled={isUploading || !files.length || !assetName}
        className='w-full'
      >
        {isUploading ? "Uploading..." : "Upload Asset"}
      </Button>
    </div>
  );
}
