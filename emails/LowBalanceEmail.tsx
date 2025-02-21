import * as React from "react";
import { Container, Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface LowBalanceEmailProps {
  currentBalance: number;
  currency: string;
}

const LowBalanceEmail = ({
  currentBalance,
  currency,
}: LowBalanceEmailProps) => {
  return (
    <BaseLayout previewText="You're Running Low on Listing Credits">
      <Section>
        <Text style={theme.typography.h1}>⚠️ Low Credit Alert</Text>

        <Section
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background,
            borderRadius: "8px",
            marginBottom: theme.spacing.lg,
          }}
        >
          <Text
            style={{
              ...theme.typography.h2,
              color: theme.colors.warning,
              margin: 0,
            }}
          >
            {currency}
            {currentBalance}
          </Text>
          <Text
            style={{
              ...theme.typography.small,
              color: theme.colors.text.secondary,
              margin: 0,
            }}
          >
            Current Balance
          </Text>
        </Section>

        <Text style={theme.typography.body}>
          Keep your workflow smooth—top up now to avoid interruptions.
        </Text>

        <Section style={{ margin: `${theme.spacing.xl} 0` }}>
          <a
            href='https://app.reelty.com/billing'
            style={{
              ...theme.buttons.primary,
              backgroundColor: theme.colors.primary,
              borderRadius: "9999px",
              display: "inline-block",
            }}
          >
            Add Listing Credits
          </a>
        </Section>
      </Section>

      <Hr style={{ borderColor: theme.colors.text.light }} />

      <Text style={theme.typography.body}>The Reelty Team</Text>
    </BaseLayout>
  );
};

export default LowBalanceEmail;
