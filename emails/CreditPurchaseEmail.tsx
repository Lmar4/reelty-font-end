import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CreditPurchaseEmailProps {
  name: string;
  credits: number;
  amount: number;
  purchaseDate: string;
}

export const CreditPurchaseEmail = ({
  name,
  credits,
  amount,
  purchaseDate,
}: CreditPurchaseEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Reelty Credit Purchase Confirmation</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Credit Purchase Confirmation</Heading>
          <Section style={section}>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              Thank you for your credit purchase! Here's a summary of your
              transaction:
            </Text>
            <Section style={details}>
              <Text style={detailRow}>
                <strong>Credits Purchased:</strong> {credits}
              </Text>
              <Text style={detailRow}>
                <strong>Amount Paid:</strong> ${amount.toFixed(2)}
              </Text>
              <Text style={detailRow}>
                <strong>Purchase Date:</strong> {purchaseDate}
              </Text>
            </Section>
            <Text style={text}>
              Your credits have been added to your account and are ready to use.
            </Text>
            <Text style={text}>
              Visit your{" "}
              <a href='https://app.reelty.com/billing'>billing dashboard</a> to
              view your updated credit balance.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const details = {
  margin: "24px 0",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
};

const detailRow = {
  margin: "8px 0",
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
};
