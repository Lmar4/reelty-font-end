import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

interface LowBalanceEmailProps {
  name: string;
  remainingCredits: number;
  expiryDate?: string;
}

export const LowBalanceEmail = ({
  name,
  remainingCredits,
  expiryDate,
}: LowBalanceEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Low Credit Balance Alert</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Low Credit Balance Alert</Heading>
          <Section style={section}>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              Your Reelty credit balance is running low. You currently have:
            </Text>
            <Section style={details}>
              <Text style={detailRow}>
                <strong>Remaining Credits:</strong> {remainingCredits}
              </Text>
              {expiryDate && (
                <Text style={detailRow}>
                  <strong>Expiry Date:</strong> {expiryDate}
                </Text>
              )}
            </Section>
            <Text style={text}>
              To ensure uninterrupted access to our video generation services,
              we recommend purchasing additional credits.
            </Text>
            <Section style={buttonContainer}>
              <Button
                href='https://app.reelty.com/billing?tab=credits'
                style={button}
              >
                Purchase Credits
              </Button>
            </Section>
            <Text style={text}>
              If you have any questions, feel free to contact our support team.
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#1c1c1c",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
};
