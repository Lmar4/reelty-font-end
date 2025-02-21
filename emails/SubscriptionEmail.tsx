import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface SubscriptionEmailProps {
  firstName: string;
  appUrl: string;
  planName: string;
  planPrice: number;
  planFeatures: string[];
}

export const SubscriptionEmail = ({
  firstName = "Rob",
  appUrl = "https://app.reelty.com",
  planName = "Pro",
  planPrice = 79,
  planFeatures = [
    "Unlimited property listings",
    "Priority support",
    "Marketing tools",
    "Profile customisation",
  ],
}: SubscriptionEmailProps) => {
  return (
    <BaseLayout previewText="Welcome to Reelty – Your Subscription is Live!">
      <Text style={theme.typography.h1}>
        You're In! Welcome to Reelty
      </Text>

      <Text style={theme.typography.body}>
        Your {planName} subscription is active. You now have access to:
      </Text>

      <Section style={{
        ...theme.containers.section,
        backgroundColor: theme.colors.background,
      }}>
        <ul style={{ 
          margin: theme.spacing.md,
          paddingLeft: theme.spacing.lg,
          listStyleType: 'none'
        }}>
          {planFeatures.map((feature, index) => (
            <li key={index} style={{
              ...theme.typography.body,
              marginBottom: theme.spacing.sm
            }}>
              ✅ {feature}
            </li>
          ))}
        </ul>
      </Section>

      <Section style={{ margin: `${theme.spacing.xl} 0` }}>
        <a href={`${appUrl}/dashboard`} style={{
          ...theme.buttons.primary,
          backgroundColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          Access Your Account
        </a>
      </Section>

      <Text style={theme.typography.body}>
        Need anything? We're here.
      </Text>

      <Hr style={{ borderColor: theme.colors.text.light }} />

      <Text style={theme.typography.body}>
        The Reelty Team
      </Text>
    </BaseLayout>
  );
};

export default SubscriptionEmail;
