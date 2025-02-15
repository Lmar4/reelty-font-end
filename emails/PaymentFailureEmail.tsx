import * as React from "react";
import { Section, Text, Link, Hr, Button } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

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
  firstName = "there",
  appUrl = "https://app.reelty.com",
  planName,
  amount,
  failureReason,
  nextAttemptDate,
  paymentMethodLast4,
}: PaymentFailureEmailProps) => {
  return (
    <BaseLayout previewText='Important: Action Required - Payment Failed'>
      <Text style={styles.heading}>Payment Failed</Text>

      <Text style={styles.text}>Hi {firstName},</Text>

      <Text style={styles.text}>
        We were unable to process your payment of ${amount.toFixed(2)} for your{" "}
        {planName} subscription.
      </Text>

      <Section style={styles.details}>
        <Text style={styles.detailRow}>
          <strong>Reason:</strong> {failureReason}
        </Text>
        {paymentMethodLast4 && (
          <Text style={styles.detailRow}>
            <strong>Payment Method:</strong> Card ending in {paymentMethodLast4}
          </Text>
        )}
        {nextAttemptDate && (
          <Text style={styles.detailRow}>
            <strong>Next Attempt:</strong> {nextAttemptDate}
          </Text>
        )}
      </Section>

      <Text style={styles.text}>
        To ensure uninterrupted access to your {planName} subscription, please
        update your payment information as soon as possible.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button
          style={{
            ...styles.button,
            padding: "12px 20px",
          }}
          href={`${appUrl}/billing/payment-methods`}
        >
          Update Payment Method
        </Button>
      </Section>

      <Text style={styles.text}>
        If you need assistance or have any questions, please don't hesitate to
        contact our support team. We're here to help!
      </Text>

      <Hr style={styles.hr} />

      <Text style={styles.signature}>
        Best regards,
        <br />
        The Reelty Team
      </Text>
    </BaseLayout>
  );
};

const styles = {
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "left" as const,
    margin: "0 0 15px",
    color: "#dc2626", // red-600
  },
  text: {
    margin: "15px 0",
    fontSize: "16px",
    lineHeight: "1.6",
  },
  details: {
    backgroundColor: "#fee2e2", // red-100
    borderRadius: "6px",
    padding: "20px",
    margin: "20px 0",
    border: "1px solid #fecaca", // red-200
  },
  detailRow: {
    margin: "10px 0",
    fontSize: "16px",
    color: "#991b1b", // red-800
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "30px 0",
  },
  button: {
    backgroundColor: "#dc2626", // red-600
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "30px 0",
  },
  signature: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#374151",
  },
} as const;

export default PaymentFailureEmail;
