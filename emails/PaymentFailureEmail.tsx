import * as React from "react";
import { Section, Text, Link, Hr, Button } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface PaymentFailureEmailProps {
  firstName: string;
  appUrl: string;
  planName: string;
  amount: number;
  failureReason: string;
  nextAttemptDate?: string;
  paymentMethodLast4?: string;
}

export const PaymentFailureEmail = ({
  firstName = "Rob",
  appUrl = "https://app.reelty.com",
  planName = "Pro+",
  amount = 10.0,
  failureReason = "Payment failed",
  nextAttemptDate = "2024-01-01",
  paymentMethodLast4 = "1234",
}: PaymentFailureEmailProps) => {
  return (
    <BaseLayout previewText="Payment Issue – Action Required">
      <Text style={theme.typography.h1}>
        Payment Failed
      </Text>

      <Text style={theme.typography.body}>
        We couldn't process your payment of ${amount.toFixed(2)} for your {planName} subscription.
      </Text>

      <Section style={{
        ...theme.containers.section,
        backgroundColor: theme.colors.danger + '10',
        border: `1px solid ${theme.colors.danger}20`,
      }}>
        <Text style={{
          ...theme.typography.body,
          color: theme.colors.danger
        }}>
          <strong>Reason:</strong> {failureReason}
        </Text>
        {paymentMethodLast4 && (
          <Text style={{
            ...theme.typography.body,
            color: theme.colors.danger
          }}>
            <strong>Payment Method:</strong> Card ending in {paymentMethodLast4}
          </Text>
        )}
        {nextAttemptDate && (
          <Text style={{
            ...theme.typography.body,
            color: theme.colors.danger
          }}>
            <strong>Next Attempt:</strong> {nextAttemptDate}
          </Text>
        )}
      </Section>

      <Text style={theme.typography.body}>
        To keep your subscription active, update your payment details now.
      </Text>

      <Section style={{ margin: `${theme.spacing.xl} 0` }}>
        <a href={`${appUrl}/billing/payment-methods`} style={{
          ...theme.buttons.primary,
          backgroundColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          Update Payment Method
        </a>
      </Section>

      <Text style={theme.typography.body}>
        Need help? Reach out—we're here.
      </Text>

      <Hr style={{ borderColor: theme.colors.text.light }} />

      <Text style={theme.typography.body}>
        The Reelty Team
      </Text>
    </BaseLayout>
  );
};
