import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

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
  firstName = "Rob",
  appUrl = "https://app.reelty.com",
  oldPlanName = "Pro",
  newPlanName = "Pro",
  oldPlanPrice = 9.99,
  newPlanPrice = 9.99,
  priceDifference = 0,
  isUpgrade = false,
  newFeatures = [],
  effectiveDate = "2024-01-01",
  nextBillingDate = "2024-02-01",
}: SubscriptionChangeEmailProps) => {
  return (
    <BaseLayout
      previewText={`Your Reelty Plan Has Been ${
        isUpgrade ? "Upgraded" : "Changed"
      }!`}
    >
      <Text style={theme.typography.h1}>
        Subscription {isUpgrade ? "Upgraded" : "Changed"}
      </Text>

      <Text style={theme.typography.body}>
        Your plan has been successfully updated from {oldPlanName} to {newPlanName}, 
        effective {effectiveDate}.
      </Text>

      <Section style={{
        ...theme.containers.section,
        backgroundColor: theme.colors.background,
      }}>
        <Text style={{
          ...theme.typography.h2,
          color: theme.colors.primary,
          marginBottom: theme.spacing.md,
        }}>
          Details
        </Text>
        <Text style={theme.typography.body}>
          <strong>Previous Plan:</strong> {oldPlanName}
        </Text>
        <Text style={theme.typography.body}>
          <strong>New Plan:</strong> {newPlanName}
        </Text>
        {priceDifference > 0 && (
          <Text style={theme.typography.body}>
            <strong>Price Adjustment:</strong> ${priceDifference}/month
          </Text>
        )}
        <Text style={theme.typography.body}>
          <strong>Next Billing Date:</strong> {nextBillingDate}
        </Text>
      </Section>

      {newFeatures.length > 0 && (
        <>
          <Text style={theme.typography.h2}>
            New Features Available:
          </Text>
          <ul style={{ paddingLeft: theme.spacing.lg }}>
            {newFeatures.map((feature, index) => (
              <li key={index} style={{
                ...theme.typography.body,
                margin: theme.spacing.xs
              }}>
                {feature}
              </li>
            ))}
          </ul>
        </>
      )}

      <Text style={theme.typography.body}>
        Your subscription will renew at the new rate automatically. Manage your settings anytime.
      </Text>

      <Section style={{ margin: `${theme.spacing.xl} 0` }}>
        <a href={`${appUrl}/dashboard/settings`} style={{
          ...theme.buttons.primary,
          backgroundColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          Manage Subscription
        </a>
      </Section>

      <Text style={theme.typography.body}>
        Have questions? We're here.
      </Text>

      <Hr style={{ borderColor: theme.colors.text.light }} />

      <Text style={theme.typography.body}>
        The Reelty Team
      </Text>
    </BaseLayout>
  );
};

export default SubscriptionChangeEmail;
