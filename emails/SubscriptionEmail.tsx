import * as React from "react";
import { Section, Text, Link, Hr, Button } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface SubscriptionEmailProps {
  firstName: string;
  appUrl: string;
  planName: string;
  planPrice: number;
  planFeatures: string[];
}

export const SubscriptionEmail = ({
  firstName = "there",
  appUrl = "https://app.reelty.com",
  planName = "Pro",
  planPrice = 79,
  planFeatures = [],
}: SubscriptionEmailProps) => {
  return (
    <BaseLayout previewText='Your Reelty subscription has been confirmed!'>
      <Text style={styles.heading}>Thank You for Your Subscription!</Text>

      <Text style={styles.text}>Hi {firstName},</Text>

      <Text style={styles.text}>
        Your subscription to Reelty has been confirmed. We're excited to have
        you as a {planName} member!
      </Text>

      <Section style={styles.planDetails}>
        <Text style={styles.planName}>{planName} Plan</Text>
        <Text style={styles.planPrice}>${planPrice}/month</Text>
        <ul style={styles.featureList}>
          {planFeatures.map((feature, index) => (
            <li key={index} style={styles.featureItem}>
              {feature}
            </li>
          ))}
        </ul>
      </Section>

      <Text style={styles.text}>
        Your subscription will automatically renew each month. You can manage
        your subscription settings anytime from your account dashboard.
      </Text>

      <Text style={styles.subheading}>Here's what you can do next:</Text>
      <ul style={styles.list}>
        <li style={styles.listItem}>Explore your new features</li>
        <li style={styles.listItem}>Set up your preferences</li>
        <li style={styles.listItem}>Contact our premium support team</li>
      </ul>

      <Section style={styles.buttonContainer}>
        <Button style={styles.button} href={`${appUrl}/dashboard`}>
          Access Your Account
        </Button>
      </Section>

      <Text style={styles.text}>
        If you have any questions about your subscription or need help getting
        started, our support team is here to help.
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
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1e40af",
    margin: "0 0 10px",
  },
  planPrice: {
    fontSize: "20px",
    color: "#4b5563",
    margin: "0 0 20px",
  },
  featureList: {
    margin: "15px 0",
    paddingLeft: "20px",
  },
  featureItem: {
    margin: "10px 0",
  },
  subheading: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "25px 0 10px",
  },
  list: {
    margin: "15px 0",
    paddingLeft: "20px",
  },
  listItem: {
    margin: "10px 0",
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
    padding: "12px 20px",
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

export default SubscriptionEmail;
