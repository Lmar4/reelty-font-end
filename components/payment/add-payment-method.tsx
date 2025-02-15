import { useState } from "react";
import { useCreateSetupIntent } from "@/hooks/queries/use-payment-methods";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface AddPaymentMethodProps {
  customerId?: string;
  onSuccess?: () => void;
}

function AddPaymentMethodForm({ onSuccess }: { onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/billing`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Payment method added successfully");
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to add payment method");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <PaymentElement />
      <Button
        type='submit'
        disabled={!stripe || isProcessing}
        className='w-full'
      >
        {isProcessing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Add Payment Method
      </Button>
    </form>
  );
}

export function AddPaymentMethod({
  customerId,
  onSuccess,
}: AddPaymentMethodProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createSetupIntent, isPending } = useCreateSetupIntent();
  const [clientSecret, setClientSecret] = useState<string>();

  const handleOpen = async () => {
    if (!customerId) return;

    try {
      const { clientSecret } = await createSetupIntent(customerId);
      setClientSecret(clientSecret);
      setOpen(true);
    } catch (error) {
      toast.error("Failed to initialize payment method setup");
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          onClick={handleOpen}
          disabled={isPending || !customerId}
        >
          {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          <Plus className='mr-2 h-4 w-4' />
          Add Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <Card className='p-4'>
              <AddPaymentMethodForm onSuccess={handleSuccess} />
            </Card>
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
