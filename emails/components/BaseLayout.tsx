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
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export const BaseLayout = ({ children, previewText }: BaseLayoutProps) => {
  return (
    <Html>
      <Head>
        <title>Reelty</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img
              src='{{app_url}}/images/logo.png'
              alt='Reelty Logo'
              width='150'
              height='auto'
            />
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Reelty. All rights reserved.
            </Text>
            <Text style={styles.footerSmall}>
              <small>
                This is a transactional email from Reelty. You can manage your
                email preferences in your account settings.
              </small>
            </Text>
          </Section>
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
