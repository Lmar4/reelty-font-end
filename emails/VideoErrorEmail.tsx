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

interface VideoErrorEmailProps {
  firstName: string;
  appUrl: string;
  listingAddress: string;
  errorMessage: string;
  supportTicketId?: string;
}

export default function VideoErrorEmail({
  firstName,
  appUrl,
  listingAddress,
  errorMessage,
  supportTicketId,
}: VideoErrorEmailProps) {
  const previewText = `We encountered an issue with your video for ${listingAddress}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <BaseLayout previewText={previewText}>
        <Container>
          <Heading className='text-2xl font-bold text-gray-800 my-8 text-center'>
            Video Generation Issue
          </Heading>

          <Section className='bg-white rounded-lg p-6 shadow-lg'>
            <Text className='text-gray-700 text-base mb-4'>
              Hi {firstName},
            </Text>

            <Text className='text-gray-700 text-base mb-4'>
              We encountered an issue while generating your video reel for{" "}
              <strong>{listingAddress}</strong>.
            </Text>

            <Section className='bg-red-50 border border-red-100 rounded-lg p-4 mb-6'>
              <Text className='text-red-700 text-sm'>
                Error Details: {errorMessage}
              </Text>
              {supportTicketId && (
                <Text className='text-red-700 text-sm mt-2'>
                  Support Ticket: #{supportTicketId}
                </Text>
              )}
            </Section>

            <Text className='text-gray-700 text-base mb-6'>
              Our team has been notified and is working to resolve this issue.
              You can try generating the video again or contact our support team
              for assistance.
            </Text>

            <div className='flex gap-4'>
              <Button
                className='bg-purple-600 text-white rounded-lg px-6 py-3 font-medium text-center flex-1'
                href={`${appUrl}/dashboard`}
              >
                Go to Dashboard
              </Button>
              <Button
                className='bg-white border border-purple-600 text-purple-600 rounded-lg px-6 py-3 font-medium text-center flex-1'
                href={`${appUrl}/support`}
              >
                Contact Support
              </Button>
            </div>

            <Hr className='border-gray-200 my-6' />

            <Text className='text-gray-600 text-sm'>
              If you continue to experience issues, please don't hesitate to
              reach out to our support team.
            </Text>
          </Section>

          <Text className='text-gray-500 text-sm text-center mt-8'>
            Need immediate assistance? Contact our support team at{" "}
            <Link href='mailto:support@reelty.com' className='text-purple-600'>
              support@reelty.com
            </Link>
          </Text>
        </Container>
      </BaseLayout>
    </Html>
  );
}
