import { Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./components/BaseLayout";
import { theme } from "./components/EmailStyles";
import { Hr } from "@react-email/components";

interface ProductUpdateEmailProps {
  firstName: string;
  updateTitle: string;
  updateDescription: string;
  learnMoreUrl?: string;
}

const ProductUpdateEmail = ({
  firstName = "Rob",
  updateTitle = "New Feature",
  updateDescription = "Something new and exciting!",
  learnMoreUrl = "https://reelty.com",
}: ProductUpdateEmailProps) => {
  return (
    <BaseLayout previewText={`🚀 New Feature Alert: ${updateTitle}`}>
      <Text style={theme.typography.h1}>
        New Reelty Feature!
      </Text>
      
      <Text style={theme.typography.body}>
        We just rolled out {updateTitle}, designed to make your workflow even better.
      </Text>
      
      <Text style={theme.typography.body}>
        {updateDescription}
      </Text>
      
      {learnMoreUrl && (
        <div style={{ margin: `${theme.spacing.lg} 0` }}>
          <a href={learnMoreUrl} style={{
            ...theme.buttons.primary,
            backgroundColor: theme.colors.primary,
            borderRadius: '9999px',
            display: 'inline-block'
          }}>
            Learn More
          </a>
        </div>
      )}
      
      <Text style={theme.typography.body}>
        We're always working to improve Reelty—more to come...
      </Text>
      
      <Hr style={{ borderColor: theme.colors.text.light }} />
      
      <Text style={theme.typography.body}>
        The Reelty Team
      </Text>
    </BaseLayout>
  );
};

export default ProductUpdateEmail;
