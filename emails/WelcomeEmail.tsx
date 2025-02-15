import * as React from "react";
import { Section, Text, Link, Hr, Button } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface WelcomeEmailProps {
  firstName: string;
  appUrl: string;
}

export const WelcomeEmail = ({
  firstName = "there",
  appUrl = "https://app.reelty.com",
}: WelcomeEmailProps) => {
  return (
    <BaseLayout previewText="Welcome to Reelty! Let's get you started.">
      <Text style={styles.heading}>Welcome to Reelty, {firstName}!</Text>

      <Text style={styles.text}>
        We're thrilled to have you on board. Your account has been successfully
        created, and you're all set to start using Reelty to manage your real
        estate business more efficiently.
      </Text>

      <Text style={styles.subheading}>Getting Started</Text>
      <ul style={styles.list}>
        <li style={styles.listItem}>Complete your profile</li>
        <li style={styles.listItem}>Add your first property listing</li>
        <li style={styles.listItem}>Explore our analytics dashboard</li>
        <li style={styles.listItem}>Set up your notification preferences</li>
      </ul>

      <Text style={styles.text}>
        Our support team is here to help you make the most of your Reelty
        experience. If you have any questions, don't hesitate to reach out.
      </Text>

      <Section style={styles.buttonContainer}>
        <Button style={styles.button} href={`${appUrl}/dashboard`}>
          Go to Dashboard
        </Button>
      </Section>

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
  subheading: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "25px 0 10px",
  },
  text: {
    margin: "15px 0",
    fontSize: "16px",
    lineHeight: "1.6",
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

export default WelcomeEmail;
