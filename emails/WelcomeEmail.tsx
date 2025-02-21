import * as React from "react";
import { Section, Text, Hr, Img } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface WelcomeEmailProps {
  firstName: string;
  appUrl: string;
}

const WelcomeEmail = ({
  firstName = "Rob",
  appUrl = "https://app.reelty.com",
}: WelcomeEmailProps) => {
  return (
    <BaseLayout 
      previewText="Welcome to Reelty! Let's Get You Started"
      showLogo={false}
    >
      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.md
      }}>
        👋 I'm Lucas, founder of Reelty.
      </Text>

      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.md
      }}>
        Reelty makes social media marketing effortless.
      </Text>

      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.lg
      }}>
        Traditional video production is slow, expensive, and impossible to scale.
      </Text>

      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.lg
      }}>
        <strong>Reelty turns listing photos into high-quality Reels in seconds</strong>—no editing, 
        no delays, just ready-to-post content that gets more eyes on your listings and more offers 
        on the table.
      </Text>

      <div style={{ marginBottom: theme.spacing.lg }}>
        <a href={`${appUrl}/dashboard`} style={{
          ...theme.buttons.primary,
          backgroundColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          Get Started
        </a>
      </div>

      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.lg
      }}>
        Expensive media doesn't sell homes, smart media does.
      </Text>

      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.lg
      }}>
        Let's get to work.
      </Text>

      <Text style={{
        ...theme.typography.body,
        marginBottom: theme.spacing.md
      }}>
        Lucas Martin
        <br />
        Founder & CEO
      </Text>

      <Img
        src="{{app_url}}/images/logo.png"
        alt="Reelty Logo"
        width="100"
        height="auto"
      />
    </BaseLayout>
  );
};

export default WelcomeEmail;
