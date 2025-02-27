import {
  useDeletePaymentMethod,
  usePaymentMethods,
  useUpdateDefaultPaymentMethod,
} from "@/hooks/queries/use-payment-methods";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CreditCard, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodsListProps {
  customerId?: string;
  className?: string;
}

export function PaymentMethodsList({
  customerId,
  className,
}: PaymentMethodsListProps) {
  const { data: paymentMethods, isLoading } = usePaymentMethods(customerId);
  const { mutate: deletePaymentMethod, isPending: isDeleting } =
    useDeletePaymentMethod();
  const { mutate: updateDefaultPaymentMethod, isPending: isUpdatingDefault } =
    useUpdateDefaultPaymentMethod();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-4'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (!paymentMethods?.data?.length) {
    return (
      <div className='flex flex-col items-center justify-center p-4 text-center'>
        <CreditCard className='h-12 w-12 text-muted-foreground mb-2' />
        <p className='text-muted-foreground'>No payment methods found</p>
      </div>
    );
  }

  const handleSetDefault = (paymentMethodId: string) => {
    if (!customerId) return;
    updateDefaultPaymentMethod({ customerId, paymentMethodId });
  };

  const handleDelete = (paymentMethodId: string) => {
    deletePaymentMethod(paymentMethodId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {paymentMethods.data.map((method) => (
        <Card key={method.id} className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <CreditCard className='h-6 w-6' />
              <div>
                <p className='font-medium'>
                  {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}{" "}
                  •••• {method.last4}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Expires {method.expMonth.toString().padStart(2, "0")}/
                  {method.expYear}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              {!method.isDefault && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleSetDefault(method.id)}
                  disabled={isUpdatingDefault}
                >
                  {isUpdatingDefault && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Set as default
                </Button>
              )}
              {method.isDefault && (
                <span className='text-sm text-muted-foreground'>Default</span>
              )}
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleDelete(method.id)}
                disabled={isDeleting || method.isDefault}
                className='text-destructive hover:text-destructive/90 hover:bg-destructive/10'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
