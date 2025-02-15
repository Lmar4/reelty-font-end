import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, feedback: string) => Promise<void>;
  planName: string;
  nextBillingDate: string;
}

const CANCELLATION_REASONS = [
  "Too expensive",
  "Not using enough",
  "Missing features",
  "Found alternative",
  "Technical issues",
  "Other",
] as const;

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  onConfirm,
  planName,
  nextBillingDate,
}: CancelSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  const handleConfirm = async () => {
    if (!reason) {
      toast.error("Please select a reason for cancellation");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(reason, feedback);
      toast.success("Subscription cancelled successfully");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your {planName} subscription?
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <p className='text-sm text-yellow-800'>
              Your subscription will remain active until {nextBillingDate}.
              After that, you'll lose access to premium features.
            </p>
          </div>

          <div className='grid gap-2'>
            <label
              htmlFor='reason'
              className='text-sm font-medium text-gray-700'
            >
              Reason for cancellation
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id='reason'>
                <SelectValue placeholder='Select a reason' />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <label
              htmlFor='feedback'
              className='text-sm font-medium text-gray-700'
            >
              Additional feedback (optional)
            </label>
            <Textarea
              id='feedback'
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='Tell us how we can improve...'
              className='h-24'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Keep Subscription
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
