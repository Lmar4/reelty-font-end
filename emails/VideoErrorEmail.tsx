import * as React from "react";
import { Section, Text, Link } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";
import { Hr } from "@react-email/components";

interface VideoErrorEmailProps {
  firstName: string;
  appUrl: string;
  listingAddress: string;
  errorMessage: string;
  supportTicketId?: string;
}

export default function VideoErrorEmail({
  firstName = "Rob",
  appUrl = "https://app.reelty.com",
  listingAddress = "123 Main St",
  errorMessage = "Something went wrong",
  supportTicketId = "123",
}: VideoErrorEmailProps) {
  return (
    <BaseLayout previewText={`⚠️ Issue with Your Video for ${listingAddress}`}>
      <Text style={{
        ...theme.typography.h1,
        marginBottom: theme.spacing.lg
      }}>
        Something Went Wrong…
      </Text>

      <Text style={theme.typography.body}>
        We hit a snag while generating your reels for <strong>{listingAddress}</strong>.
      </Text>

      <Section style={{
        backgroundColor: theme.colors.danger + '10',
        border: `1px solid ${theme.colors.danger}20`,
        borderRadius: '8px',
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg
      }}>
        <Text style={{
          ...theme.typography.small,
          color: theme.colors.danger
        }}>
          Error Details: {errorMessage}
        </Text>
        {supportTicketId && (
          <Text style={{
            ...theme.typography.small,
            color: theme.colors.danger,
            marginTop: theme.spacing.sm
          }}>
            Support Ticket: #{supportTicketId}
          </Text>
        )}
      </Section>

      <Text style={theme.typography.body}>
        We're on it. You can try again or contact us for help.
      </Text>

      <div style={{ 
        display: 'flex', 
        gap: theme.spacing.md,
        margin: `${theme.spacing.lg} 0`
      }}>
        <a href={`${appUrl}/dashboard`} style={{
          ...theme.buttons.primary,
          backgroundColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          Go to Dashboard
        </a>
        <a href={`${appUrl}/support`} style={{
          ...theme.buttons.secondary,
          color: theme.colors.primary,
          borderColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          Contact Support
        </a>
      </div>

      <Hr style={{ borderColor: theme.colors.text.light }} />
      
      <Text style={theme.typography.body}>
        The Reelty Team
      </Text>
    </BaseLayout>
  );
}
