import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, Video, Settings, Check, MapPin } from "lucide-react";
import { useCreateJob } from "@/hooks/use-jobs";
import { useCreateListing, useUploadPhoto } from "@/hooks/queries/use-listings";
import { useTemplates } from "@/hooks/queries/use-templates";
import FileUpload from "./FileUpload";
import AddressInput from "./AddressInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import PhotoManager from "./PhotoManager";

interface VideoGenerationFlowProps {
  onComplete: () => void;
  userTier: "free" | "pro" | "enterprise";
}

const STEPS = {
  TEMPLATE: "template",
  ADDRESS: "address",
  UPLOAD: "upload",
  PROCESSING: "processing",
  COMPLETE: "complete",
} as const;

type Step = (typeof STEPS)[keyof typeof STEPS];

// Fix the step comparison logic by converting steps to numbers
const STEP_ORDER = {
  [STEPS.TEMPLATE]: 0,
  [STEPS.ADDRESS]: 1,
  [STEPS.UPLOAD]: 2,
  [STEPS.PROCESSING]: 3,
  [STEPS.COMPLETE]: 4,
} as const;

export default function VideoGenerationFlow({
  onComplete,
  userTier,
}: VideoGenerationFlowProps) {
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.TEMPLATE);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");

  const createJob = useCreateJob();
  const createListing = useCreateListing();
  const uploadPhoto = useUploadPhoto();
  const { data: templates, isLoading: isLoadingTemplates } =
    useTemplates(userTier);

  const handlePhotoSelect = (files: File[]) => {
    if (files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }
    setSelectedPhotos(files);
  };

  const handleAddressSelect = (
    selectedAddress: string,
    coords: { lat: number; lng: number }
  ) => {
    setAddress(selectedAddress);
    setCoordinates(coords);
  };

  const handlePhotoReorder = (reorderedPhotos: File[]) => {
    setSelectedPhotos(reorderedPhotos);
  };

  const handleStartProcessing = async () => {
    if (
      !userId ||
      !selectedTemplate ||
      selectedPhotos.length === 0 ||
      !address ||
      !coordinates
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setCurrentStep(STEPS.PROCESSING);
    setProgress(0);
    setProcessingStatus("Creating listing...");

    try {
      // Create listing
      const listing = await createListing.mutateAsync({
        userId,
        address,
        coordinates,
        photoLimit: 10,
      });

      setProgress(20);
      setProcessingStatus("Uploading photos...");

      // Upload photos
      const uploadPromises = selectedPhotos.map((file, index) =>
        uploadPhoto.mutateAsync({
          file,
          listingId: listing.id,
          order: index,
        })
      );

      const uploadResults = await Promise.all(uploadPromises);
      const uploadedFilePaths = uploadResults.map((result) => result.filePath);

      setProgress(60);
      setProcessingStatus("Generating video...");

      // Create video generation job
      await createJob.mutateAsync({
        listingId: listing.id,
        template: selectedTemplate,
        inputFiles: uploadedFilePaths,
      });

      setProgress(100);
      setProcessingStatus("Complete!");
      setCurrentStep(STEPS.COMPLETE);

      // Notify completion after a brief delay
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error in video generation:", error);
      toast.error("Failed to generate video. Please try again.");
      setCurrentStep(STEPS.UPLOAD);
    }
  };

  if (isLoadingTemplates) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <LoadingState text='Loading templates...' size='lg' />
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Progress Steps */}
      <div className='flex items-center justify-between mb-8'>
        {Object.values(STEPS).map((step, index) => (
          <div key={step} className='flex items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step
                  ? "bg-purple-600 text-white"
                  : STEP_ORDER[currentStep] > STEP_ORDER[step]
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {STEP_ORDER[currentStep] > STEP_ORDER[step] ? (
                <Check className='w-4 h-4' />
              ) : (
                index + 1
              )}
            </div>
            {index < Object.values(STEPS).length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  STEP_ORDER[currentStep] > STEP_ORDER[step]
                    ? "bg-green-500"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode='wait'>
        {currentStep === STEPS.TEMPLATE && (
          <motion.div
            key='template'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className='space-y-4'>
              <Label>Select Template</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {templates?.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "border-purple-500 ring-2 ring-purple-500"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <Video className='w-5 h-5 text-purple-500 mt-1' />
                      <div>
                        <h3 className='font-semibold'>{template.name}</h3>
                        <p className='text-sm text-gray-500'>
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                className='w-full mt-6'
                onClick={() => setCurrentStep(STEPS.ADDRESS)}
                disabled={!selectedTemplate}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === STEPS.ADDRESS && (
          <motion.div
            key='address'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <MapPin className='w-5 h-5 text-purple-500' />
                <h3 className='text-lg font-semibold'>Property Location</h3>
              </div>
              <AddressInput onAddressSelect={handleAddressSelect} />
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setCurrentStep(STEPS.TEMPLATE)}
              >
                Back
              </Button>
              <Button
                className='flex-1'
                onClick={() => setCurrentStep(STEPS.UPLOAD)}
                disabled={!address || !coordinates}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === STEPS.UPLOAD && (
          <motion.div
            key='upload'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='space-y-6'
          >
            <div>
              <Label>Upload Photos</Label>
              <p className='text-sm text-gray-500 mb-4'>
                Select up to 10 photos for your video reel
              </p>
              <FileUpload
                onFilesSelected={handlePhotoSelect}
                maxFiles={10}
                buttonText='Select photos for video reel'
              />
            </div>

            {selectedPhotos.length > 0 && (
              <>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      {selectedPhotos.length} photos selected
                    </span>
                    <span className='text-sm text-gray-500'>
                      {selectedPhotos.length}/10
                    </span>
                  </div>
                  <Progress value={(selectedPhotos.length / 10) * 100} />
                </div>

                <PhotoManager
                  photos={selectedPhotos}
                  onPhotosReorder={handlePhotoReorder}
                />
              </>
            )}

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setCurrentStep(STEPS.ADDRESS)}
              >
                Back
              </Button>
              <Button
                className='flex-1'
                onClick={handleStartProcessing}
                disabled={selectedPhotos.length === 0}
              >
                Start Processing
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === STEPS.PROCESSING && (
          <motion.div
            key='processing'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='text-center space-y-6'
          >
            <div className='flex flex-col items-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center'>
                <Loader2 className='w-8 h-8 text-purple-600 animate-spin' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>{processingStatus}</h3>
                <p className='text-sm text-gray-500'>
                  Please wait while we process your video
                </p>
              </div>
            </div>
            <Progress value={progress} />
          </motion.div>
        )}

        {currentStep === STEPS.COMPLETE && (
          <motion.div
            key='complete'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='text-center space-y-6'
          >
            <div className='flex flex-col items-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center'>
                <Check className='w-8 h-8 text-green-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  Video Generated Successfully!
                </h3>
                <p className='text-sm text-gray-500'>
                  Your video reel is ready. You will receive an email
                  notification when it's available.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
