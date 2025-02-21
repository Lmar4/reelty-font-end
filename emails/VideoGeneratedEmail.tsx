import * as React from "react";
import { Section, Text, Link, Hr } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface VideoGeneratedEmailProps {
  firstName: string;
  appUrl: string;
  listingAddress: string;
  videoUrl: string;
  template: string;
}

export default function VideoGeneratedEmail({
  firstName = "Rob",
  appUrl = "https://app.reelty.com",
  listingAddress = "123 Main St",
  videoUrl = "https://video.reelty.com",
  template = "default",
}: VideoGeneratedEmailProps) {
  return (
    <BaseLayout previewText={`Your Reelty Videos for ${listingAddress} Are Ready! 🎥`}>
      <Text style={{
        ...theme.typography.h1,
        marginBottom: theme.spacing.lg
      }}>
        Your Videos Are Ready!
      </Text>

      <Text style={theme.typography.body}>
        Your reels for <strong>{listingAddress}</strong> are finished using our {template} template.
      </Text>

      <Text style={theme.typography.body}>
        Ready to download and share? Click below.
      </Text>

      <div style={{ margin: `${theme.spacing.lg} 0` }}>
        <a href={videoUrl} style={{
          ...theme.buttons.primary,
          backgroundColor: theme.colors.primary,
          borderRadius: '9999px',
          display: 'inline-block'
        }}>
          View Your Reels
        </a>
      </div>

      <Text style={theme.typography.body}>
        Manage all your videos anytime in your{" "}
        <Link
          href={`${appUrl}/dashboard`}
          style={{ color: theme.colors.primary }}
        >
          dashboard
        </Link>
        .
      </Text>

      <Hr style={{ borderColor: theme.colors.text.light }} />
      
      <Text style={theme.typography.body}>
        The Reelty Team
      </Text>
    </BaseLayout>
  );
}
