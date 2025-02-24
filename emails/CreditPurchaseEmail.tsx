import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface CreditPurchaseEmailProps {
  name: string;
  credits: number;
  amount: number;
  purchaseDate: string;
}

const CreditPurchaseEmail = ({
  name,
  credits,
  amount,
  purchaseDate,
}: CreditPurchaseEmailProps) => {
  return (
    <BaseLayout previewText='Your Reelty Listing Credits Are Ready'>
      <Text style={theme.typography.h1}>Listing Credit Purchase Confirmed</Text>

      <Text style={theme.typography.body}>
        Thanks for your purchase! Your Listing Credits have been added to your
        account—you're all set to create your real estate reels.
      </Text>

      <Section
        style={{
          backgroundColor: theme.colors.background,
          padding: theme.spacing.md,
          borderRadius: "8px",
          margin: `${theme.spacing.md} 0`,
        }}
      >
        <Text style={theme.typography.body}>
          <strong>Credits Purchased:</strong> {credits}
        </Text>
        <Text style={theme.typography.body}>
          <strong>Amount Paid:</strong> ${amount.toFixed(2)}
        </Text>
        <Text style={theme.typography.body}>
          <strong>Purchase Date:</strong> {purchaseDate}
        </Text>
      </Section>

      <Text style={theme.typography.body}>
        Check your{" "}
        <a
          href='https://app.reelty.com/billing'
          style={{
            textDecoration: "underline",
          }}
        >
          billing dashboard
        </a>{" "}
        to see your updated balance.
      </Text>

      <Hr style={{ borderColor: theme.colors.text.light }} />

      <Text style={theme.typography.body}>The Reelty Team</Text>

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
          Update Payment Method
        </a>
      </Section>
    </BaseLayout>
  );
};

export default CreditPurchaseEmail;
