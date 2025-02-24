import * as React from "react";
import { Text, Link } from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";

interface VideoGeneratedEmailProps {
  firstName: string;
  listingAddress: string;
  listingUrl: string;
}

export default function VideoGeneratedEmail({
  firstName,
  listingAddress,
  listingUrl,
}: VideoGeneratedEmailProps) {
  return (
    <BaseLayout
      previewText={`Your Reelty Videos for ${listingAddress} Are Ready! 🎥`}
    >
      <Text
        style={{
          ...theme.typography.h1,
          marginBottom: theme.spacing.lg,
        }}
      >
        Your Videos Are Ready!
      </Text>

      <Text style={theme.typography.body}>
        Great news! All your reels for <strong>{listingAddress}</strong> are now
        ready.
      </Text>

      <div style={{ margin: `${theme.spacing.lg} 0` }}>
        <a
          href={listingUrl}
          style={{
            ...theme.buttons.primary,
            backgroundColor: theme.colors.primary,
            borderRadius: "9999px",
            display: "inline-block",
          }}
        >
          View Your Reels
        </a>
      </div>

      <Text style={theme.typography.body}>The Reelty Team</Text>
    </BaseLayout>
  );
}
