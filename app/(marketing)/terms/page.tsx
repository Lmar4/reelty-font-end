import Footer from "@/components/reelty/Footer";

export default function Terms() {
  return (
    <>
      <div className='max-w-[1200px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-between'>
        <div className='prose prose-gray max-w-none'>
          <h1 className='text-[40px] font-semibold text-[#1c1c1c] mb-8'>
            Reelty Terms of Service
          </h1>
          <p className='mb-8'>Last updated: 02/13/2025</p>

          <p className='mb-6'>
            Welcome to Reelty! These Terms of Service ("Terms") govern your use
            of Reelty, an AI-powered real estate media service that transforms
            listing photos into short-form video reels ("Service"), operated by
            021 Media LLC, a limited liability company registered in California
            ("021 Media LLC," "Reelty," "we," "us," or "our"). By accessing or
            using our Service, you agree to be bound by these Terms. If you do
            not agree to these Terms, please do not use our Service.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            1. Acceptance of Terms
          </h2>
          <p className='mb-6'>
            By accessing or using our Service, you confirm that you have read,
            understood, and agree to be bound by these Terms, including any
            future modifications. If you do not agree to these Terms, you must
            refrain from using our Service.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            2. Modification of Terms
          </h2>
          <p className='mb-6'>
            We reserve the right to change or modify these Terms at any time. We
            will notify you of any changes by posting the updated Terms on our
            website and revising the "Last updated" date at the top of this
            page. Your continued use of our Service after any modifications
            constitutes your acceptance of the new Terms.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>3. Use of Service</h2>
          <p className='mb-6'>
            You are solely responsible for your use of our Service and any
            content you create, upload, or share through our Service. You agree
            to use our Service only for lawful purposes and in compliance with
            all applicable laws and regulations. Unauthorized or improper use of
            the Service is prohibited.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            4. User Content and Media Ownership
          </h2>
          <p className='mb-4'>
            You are solely responsible for any content, including images and
            property information ("User Content"), that you upload or otherwise
            submit to Reelty. You represent and warrant that you own all
            necessary rights or have obtained all requisite permissions to use
            and share such User Content.
          </p>
          <p className='mb-4'>Media Ownership and Rights:</p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              Your Rights: You retain full ownership and all rights to your
              images and media.
            </li>
            <li className='mb-2'>
              License to Reelty: By uploading your media, you grant Reelty a
              limited, non-exclusive license solely for the purpose of
              transforming your content into video reels and delivering our
              Service to you.
            </li>
            <li className='mb-2'>
              Use of Your Media: Under no circumstances will Reelty use or
              market any media that it does not have the rights to, nor will we
              use your media for promotional purposes without obtaining your
              explicit permission.
            </li>
          </ul>

          <h2 className='text-2xl font-semibold mb-4'>5. Prohibited Conduct</h2>
          <p className='mb-4'>
            When using our Service, you agree not to engage in any activities
            that:
          </p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              Infringe on any third party's intellectual property or proprietary
              rights.
            </li>
            <li className='mb-2'>
              Involve the copying, distributing, or public disclosure of any
              part of our Service without our express permission.
            </li>
            <li className='mb-2'>
              Harass, abuse, or harm another person or entity.
            </li>
            <li className='mb-2'>
              Interfere with or disrupt the proper functioning of our Service.
            </li>
            <li className='mb-2'>
              Attempt to bypass or disable any security or access control
              measures implemented on our Service.
            </li>
          </ul>

          <h2 className='text-2xl font-semibold mb-4'>
            6. Payment and Billing
          </h2>
          <p className='mb-4'>
            Our Service operates on both a subscription basis and a
            pay-as-you-go credit system. All payments are processed through
            Stripe, and by using our Service, you agree to be bound by Stripe's
            terms and conditions as applicable.
          </p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              Subscription Model:
              <ul className='list-disc pl-6 mt-2'>
                <li>
                  Subscriptions are billed on a recurring basis (monthly or
                  annually) as specified at the time of purchase.
                </li>
                <li>
                  Your subscription will automatically renew unless you cancel
                  at least 24 hours before the end of the current billing
                  period.
                </li>
                <li>
                  You are responsible for all charges incurred under your
                  account, including applicable taxes.
                </li>
              </ul>
            </li>
            <li className='mb-2'>
              Pay-As-You-Go Credits:
              <ul className='list-disc pl-6 mt-2'>
                <li>
                  You may purchase credits that can be used to access certain
                  features of the Service on a per-use basis.
                </li>
                <li>
                  Credits are non-refundable and must be used in accordance with
                  the credit policy outlined on our billing page.
                </li>
              </ul>
            </li>
          </ul>

          <h2 className='text-2xl font-semibold mb-4'>7. Refund Policy</h2>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              Subscription Refunds:
              <ul className='list-disc pl-6 mt-2'>
                <li>
                  If you are not satisfied with our Service, you may request a
                  refund within the first month of your subscription.
                </li>
                <li>
                  Refunds for subscriptions may be provided on a pro-rated basis
                  at our sole discretion.
                </li>
              </ul>
            </li>
            <li className='mb-2'>
              Credit Refunds:
              <ul className='list-disc pl-6 mt-2'>
                <li>Purchases of pay-as-you-go credits are non-refundable.</li>
                <li>
                  Additionally, any credits that have been spent during your
                  subscription or pay-as-you-go usage are not eligible for a
                  refund.
                </li>
              </ul>
            </li>
          </ul>

          <h2 className='text-2xl font-semibold mb-4'>8. Termination</h2>
          <p className='mb-6'>
            We reserve the right to suspend or terminate your access to our
            Service, in whole or in part, at any time and for any reason,
            without notice or liability to you. Termination may result in the
            removal of your User Content from our systems. Upon termination, all
            rights granted to you under these Terms will immediately cease.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            9. Disclaimer of Warranties
          </h2>
          <p className='mb-6'>
            Our Service is provided on an "as is" and "as available" basis
            without any warranties, either express or implied. 021 Media LLC
            disclaims all warranties, including but not limited to the implied
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not guarantee that our Service will be
            uninterrupted, error-free, or secure.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            10. Limitation of Liability
          </h2>
          <p className='mb-6'>
            To the fullest extent permitted by law, 021 Media LLC shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages (including, but not limited to, loss of profits,
            data, or goodwill) arising from or relating to your use of or
            inability to use our Service. This limitation applies whether the
            alleged liability is based on contract, tort, or any other legal
            theory, even if 021 Media LLC has been advised of the possibility of
            such damages.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            11. Governing Law and Dispute Resolution
          </h2>
          <p className='mb-6'>
            These Terms are governed by and construed in accordance with the
            laws of the State of California, without regard to its conflict of
            law provisions. Any disputes arising under or in connection with
            these Terms shall be resolved exclusively in the state or federal
            courts located in California, unless otherwise agreed in writing by
            the parties.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            12. Third-Party Services
          </h2>
          <p className='mb-4'>
            Our Service may integrate with third-party platforms to enhance
            functionality, such as enabling you to share your video reels on
            social media. By using our Service, you agree to comply with the
            terms and conditions, including privacy policies, of any third-party
            services with which we integrate.
          </p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              Responsibility: You are solely responsible for managing your
              interactions with these third-party platforms.
            </li>
            <li className='mb-2'>
              No Endorsement: The inclusion of any third-party service does not
              imply endorsement by Reelty.
            </li>
          </ul>

          <h2 className='text-2xl font-semibold mb-4'>
            13. Managing Third-Party Account Access
          </h2>
          <p className='mb-4'>
            If you choose to link your external accounts (such as social media
            profiles) with Reelty, you grant us permission to access certain
            data from those accounts to facilitate integration. You can manage
            or revoke this access at any time by:
          </p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              Visiting the respective platform's account permissions or privacy
              settings page.
            </li>
            <li className='mb-2'>
              Logging out directly from the Reelty interface, where available.
            </li>
          </ul>
          <p className='mb-6'>
            Please note that revoking such access may limit your ability to use
            certain features of our Service.
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            14. Contact Information
          </h2>
          <p className='mb-6'>
            If you have any questions or concerns regarding these Terms, please
            contact us at:
            <br />
            021 Media LLC (dba Reelty)
            <br />
            Email: info@reelty.com
          </p>

          <h2 className='text-2xl font-semibold mb-4'>15. Entire Agreement</h2>
          <p className='mb-6'>
            These Terms constitute the entire agreement between you and 021
            Media LLC regarding your use of our Service and supersede any prior
            agreements or understandings, whether written or oral, regarding the
            subject matter herein.
          </p>

          <p className='mb-8'>
            Thank you for choosing Reelty. We are committed to providing a
            high-quality, innovative service while ensuring transparency,
            fairness, and the utmost protection of your rights and content.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
