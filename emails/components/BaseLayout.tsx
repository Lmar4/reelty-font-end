import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { theme } from "./EmailStyles";

interface BaseLayoutProps {
  children: React.ReactNode;
  previewText: string; // Required preview text for email clients
  showLogo?: boolean; // Optional logo display flag
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  previewText,
  showLogo = true,
}) => {
  return (
    <Html>
      <Head>
        <title>Reelty</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f5f7ff",
          fontFamily: theme.fonts.primary,
          width: "100%",
          minHeight: "100vh",
        }}
      >
        <Container style={theme.containers.main}>
          {showLogo && (
            <div
              style={{
                textAlign: "center",
                marginBottom: theme.spacing.xl,
              }}
            >
              <Img
                src='https://res.cloudinary.com/druug7qff/image/upload/v1740411687/reelty/Asset_2-8_znkrge.png'
                alt='Reelty Logo'
                width='150'
                height='auto'
              />
            </div>
          )}

          <Section style={theme.containers.section}>{children}</Section>

          <Text
            style={{
              ...theme.typography.small,
              fontSize: "14px",
              color: "#666666",
              textAlign: "center",
            }}
          >
            © 2025 Zero21 Media LLC dba Reelty. All rights reserved.
          </Text>

          <Text
            style={{
              ...theme.typography.small,
              fontSize: "14px",
              color: "#666666",
              textAlign: "center",
            }}
          >
            This is a transactional email from Reelty. You can manage your email
            preferences in your account settings.
          </Text>

          <Text
            style={{
              ...theme.typography.small,
              fontSize: "14px",
              color: "#666666",
              textAlign: "center",
            }}
          >
            Need help? Contact our support team at{" "}
            <Link
              href='mailto:team@reelty.io'
              style={{ color: "#8b5cf6", textDecoration: "underline" }}
            >
              team@reelty.io
            </Link>
          </Text>

          <Text
            style={{
              ...theme.typography.small,
              fontSize: "14px",
              color: "#666666",
              textAlign: "center",
            }}
          >
            <Link
              href='https://reelty.io/terms'
              style={{ color: "#8b5cf6", textDecoration: "underline" }}
            >
              Terms
            </Link>
            {" • "}
            <Link
              href='https://reelty.io/privacy'
              style={{ color: "#8b5cf6", textDecoration: "underline" }}
            >
              Privacy
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    margin: "0",
    padding: "0",
    width: "100%",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: 1.6,
    backgroundColor: "#f8fafc",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  header: {
    textAlign: "center" as const,
    padding: "20px 0",
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: "30px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  footer: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#6b7280",
  },
  footerText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "5px 0",
  },
  footerSmall: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "5px 0",
  },
} as const;
