import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { BaseLayout } from "./components/BaseLayout";

interface VideoGeneratedEmailProps {
  firstName: string;
  appUrl: string;
  listingAddress: string;
  videoUrl: string;
  template: string;
}

export default function VideoGeneratedEmail({
  firstName,
  appUrl,
  listingAddress,
  videoUrl,
  template,
}: VideoGeneratedEmailProps) {
  const previewText = `Your Reelty video for ${listingAddress} is ready! 🎥`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <BaseLayout previewText={previewText}>
        <Container>
          <Heading className='text-2xl font-bold text-gray-800 my-8 text-center'>
            Your Video is Ready!
          </Heading>

          <Section className='bg-white rounded-lg p-6 shadow-lg'>
            <Text className='text-gray-700 text-base mb-4'>
              Hi {firstName},
            </Text>

            <Text className='text-gray-700 text-base mb-4'>
              Great news! We've finished generating your video reel for{" "}
              <strong>{listingAddress}</strong> using our {template} template.
            </Text>

            <Text className='text-gray-700 text-base mb-6'>
              Your video is now ready to view, download, and share. Click the
              button below to access your video.
            </Text>

            <Button
              className='bg-purple-600 text-white rounded-lg px-6 py-3 font-medium text-center block w-full'
              href={videoUrl}
            >
              View Your Video
            </Button>

            <Hr className='border-gray-200 my-6' />

            <Text className='text-gray-600 text-sm'>
              You can also access your video and manage your listings anytime by
              visiting your{" "}
              <Link href={`${appUrl}/dashboard`} className='text-purple-600'>
                dashboard
              </Link>
              .
            </Text>
          </Section>

          <Text className='text-gray-500 text-sm text-center mt-8'>
            Need help? Contact our support team at{" "}
            <Link href='mailto:support@reelty.com' className='text-purple-600'>
              support@reelty.com
            </Link>
          </Text>
        </Container>
      </BaseLayout>
    </Html>
  );
}
