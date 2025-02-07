import * as React from "react";
import { Section, Text, Link, Hr, Button } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface SubscriptionChangeEmailProps {
  firstName: string;
  appUrl: string;
  oldPlanName: string;
  newPlanName: string;
  oldPlanPrice: number;
  newPlanPrice: number;
  priceDifference: number;
  isUpgrade: boolean;
  newFeatures: string[];
  effectiveDate: string;
  nextBillingDate: string;
}

export const SubscriptionChangeEmail = ({
  firstName = "there",
  appUrl = "https://app.reelty.com",
  oldPlanName,
  newPlanName,
  oldPlanPrice,
  newPlanPrice,
  priceDifference,
  isUpgrade,
  newFeatures,
  effectiveDate,
  nextBillingDate,
}: SubscriptionChangeEmailProps) => {
  return (
    <BaseLayout
      previewText={`Your Reelty subscription has been ${
        isUpgrade ? "upgraded" : "changed"
      } to ${newPlanName}!`}
    >
      <Text style={styles.heading}>
        {isUpgrade ? "Subscription Upgraded!" : "Subscription Changed"}
      </Text>

      <Text style={styles.text}>Hi {firstName},</Text>

      <Text style={styles.text}>
        Your subscription has been successfully{" "}
        {isUpgrade ? "upgraded" : "changed"} from {oldPlanName} to {newPlanName}
        . This change is effective from {effectiveDate}.
      </Text>

      <Section style={styles.planDetails}>
        <Text style={styles.planName}>Subscription Change Details</Text>
        <Text style={styles.detailRow}>
          <strong>Previous Plan:</strong> {oldPlanName} (${oldPlanPrice}/month)
        </Text>
        <Text style={styles.detailRow}>
          <strong>New Plan:</strong> {newPlanName} (${newPlanPrice}/month)
        </Text>
        <Text style={styles.detailRow}>
          <strong>Price {isUpgrade ? "Increase" : "Adjustment"}:</strong> $
          {priceDifference}/month
        </Text>
        <Text style={styles.detailRow}>
          <strong>Next Billing Date:</strong> {nextBillingDate}
        </Text>
      </Section>

      {newFeatures.length > 0 && (
        <>
          <Text style={styles.subheading}>
            New Features You Now Have Access To:
          </Text>
          <ul style={styles.featureList}>
            {newFeatures.map((feature, index) => (
              <li key={index} style={styles.featureItem}>
                {feature}
              </li>
            ))}
          </ul>
        </>
      )}

      <Text style={styles.text}>
        Your subscription will automatically renew at the new rate. You can
        manage your subscription settings anytime from your account dashboard.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button
          style={{
            ...styles.button,
            padding: "12px 20px",
          }}
          href={`${appUrl}/dashboard/settings`}
        >
          Manage Subscription
        </Button>
      </Section>

      <Text style={styles.text}>
        If you have any questions about your subscription change or need
        assistance, our support team is here to help.
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
  },
  text: {
    margin: "15px 0",
    fontSize: "16px",
    lineHeight: "1.6",
  },
  planDetails: {
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    padding: "20px",
    margin: "20px 0",
  },
  planName: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1e40af",
    margin: "0 0 15px",
  },
  detailRow: {
    margin: "10px 0",
    fontSize: "16px",
    color: "#4b5563",
  },
  subheading: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "25px 0 10px",
  },
  featureList: {
    margin: "15px 0",
    paddingLeft: "20px",
  },
  featureItem: {
    margin: "8px 0",
    color: "#374151",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "30px 0",
  },
  button: {
    backgroundColor: "#3b82f6",
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

export default SubscriptionChangeEmail;
