import Footer from "@/components/reelty/Footer";

export default function TermsPage() {
  return (
    <>
      <div className='max-w-[1200px] mx-auto px-4 md:px-6 pt-[72px] md:pt-[72px] min-h-screen'>
        <div className='prose prose-gray max-w-none py-8 md:py-12'>
          <h1 className='text-[32px] md:text-[40px] font-semibold text-[#1c1c1c] mb-3 md:mb-4'>
            Reelty Terms of Service
          </h1>
          <p className='text-gray-600 mb-8 md:mb-12 text-sm md:text-base'>Last updated: 02/13/2025</p>
          
          <div className='space-y-8 md:space-y-12'>
            {/* Introduction */}
            <div className='space-y-4 md:space-y-6'>
              <p className='text-lg md:text-xl'>
                Welcome to Reelty!
              </p>

              <p className='text-base md:text-base'>
                These Terms of Service ("Terms") govern your use of Reelty, an AI-powered real estate media service that transforms listing photos into short-form video reels ("Service"), operated by Zero21 Media LLC, a limited liability company registered in California ("Zero21 Media LLC," "Reelty," "we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
            </div>

            {/* Numbered sections */}
            <div className='space-y-8 md:space-y-12'>
              {/* Each section has consistent spacing */}
              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>1. Acceptance of Terms</h2>
                <p className='text-base'>
                  By accessing or using our Service, you confirm that you have read, understood, and agree to be bound by these Terms, including any future modifications. If you do not agree to these Terms, you must refrain from using our Service.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>2. Modification of Terms</h2>
                <p className='text-base'>
                  We reserve the right to change or modify these Terms at any time. We will notify you of any changes by posting the updated Terms on our website and revising the "Last updated" date at the top of this page. Your continued use of our Service after any modifications constitutes your acceptance of the new Terms.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>3. Use of Service</h2>
                <p className='text-base'>
                  You are solely responsible for your use of our Service and any content you create, upload, or share through our Service. You agree to use our Service only for lawful purposes and in compliance with all applicable laws and regulations. Unauthorized or improper use of the Service is prohibited.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>4. User Content and Media Ownership</h2>
                <p className='text-base'>
                  You are solely responsible for any content, including images and property information ("User Content"), that you upload or otherwise submit to Reelty. You represent and warrant that you own all necessary rights or have obtained all requisite permissions to use and share such User Content.
                </p>
                <h3 className='text-base md:text-xl font-semibold mb-2'>Media Ownership and Rights:</h3>
                <ul className='list-disc pl-6 space-y-2'>
                  <li>Your Rights: You retain full ownership and all rights to your images and media.</li>
                  <li>License to Reelty: By uploading your media, you grant Reelty a limited, non-exclusive license solely for the purpose of transforming your content into video reels and delivering our Service to you.</li>
                  <li>Use of Your Media: Under no circumstances will Reelty use or market any media that it does not have the rights to, nor will we use your media for promotional purposes without obtaining your explicit permission.</li>
                </ul>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>5. Prohibited Conduct</h2>
                <p className='text-base'>When using our Service, you agree not to engage in any activities that:</p>
                <ul className='list-disc pl-6 space-y-2'>
                  <li>Infringe on any third party's intellectual property or proprietary rights.</li>
                  <li>Involve the copying, distributing, or public disclosure of any part of our Service without our express permission.</li>
                  <li>Harass, abuse, or harm another person or entity.</li>
                  <li>Interfere with or disrupt the proper functioning of our Service.</li>
                  <li>Attempt to bypass or disable any security or access control measures implemented on our Service.</li>
                </ul>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>6. Payment and Billing</h2>
                <p className='text-base'>
                  Our Service operates on both a subscription basis and a pay-as-you-go credit system. All payments are processed through Stripe, and by using our Service, you agree to be bound by Stripe's terms and conditions as applicable.
                </p>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-base md:text-xl font-semibold mb-2'>Subscription Model:</h3>
                    <ul className='list-disc pl-6 space-y-2'>
                      <li>Subscriptions are billed on a recurring basis (monthly or annually) as specified at the time of purchase.</li>
                      <li>Your subscription will automatically renew unless you cancel at least 24 hours before the end of the current billing period.</li>
                      <li>You are responsible for all charges incurred under your account, including applicable taxes.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-base md:text-xl font-semibold mb-2'>Pay-As-You-Go Credits:</h3>
                    <ul className='list-disc pl-6 space-y-2'>
                      <li>You may purchase credits that can be used to access certain features of the Service on a per-use basis.</li>
                      <li>Credits are non-refundable and must be used in accordance with the credit policy outlined on our billing page.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-base md:text-xl font-semibold mb-2'>Payment Processing:</h3>
                    <ul className='list-disc pl-6'>
                      <li>All transactions are processed securely via Stripe. By making a purchase, you agree to comply with Stripe's payment processing policies.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>7. Refund Policy</h2>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-base md:text-xl font-semibold mb-2'>Subscription Refunds:</h3>
                    <ul className='list-disc pl-6 space-y-2'>
                      <li>If you are not satisfied with our Service, you may request a refund within the first month of your subscription.</li>
                      <li>Refunds for subscriptions may be provided on a pro-rated basis at our sole discretion.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-base md:text-xl font-semibold mb-2'>Credit Refunds:</h3>
                    <ul className='list-disc pl-6 space-y-2'>
                      <li>Purchases of pay-as-you-go credits are non-refundable.</li>
                      <li>Additionally, any credits that have been spent during your subscription or pay-as-you-go usage are not eligible for a refund.</li>
                    </ul>
                  </div>
                </div>
                <p className='mt-4'>
                  Refund requests are subject to review and may be granted at our sole discretion. To request a refund, please contact our support team.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>8. Termination</h2>
                <p className='text-base'>
                  We reserve the right to suspend or terminate your access to our Service, in whole or in part, at any time and for any reason, without notice or liability to you. Termination may result in the removal of your User Content from our systems. Upon termination, all rights granted to you under these Terms will immediately cease.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>9. Disclaimer of Warranties</h2>
                <p className='text-base'>
                  Our Service is provided on an "as is" and "as available" basis without any warranties, either express or implied. Zero21 Media LLC disclaims all warranties, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that our Service will be uninterrupted, error-free, or secure.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>10. Limitation of Liability</h2>
                <p className='text-base'>
                  To the fullest extent permitted by law, Zero21 Media LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages (including, but not limited to, loss of profits, data, or goodwill) arising from or relating to your use of or inability to use our Service. This limitation applies whether the alleged liability is based on contract, tort, or any other legal theory, even if Zero21 Media LLC has been advised of the possibility of such damages.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>11. Governing Law and Dispute Resolution</h2>
                <p className='text-base'>
                  These Terms are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
                </p>
                <p className='mt-4'>
                  Any disputes arising under or in connection with these Terms shall be resolved exclusively in the state or federal courts located in California, unless otherwise agreed in writing by the parties.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>12. Third-Party Services</h2>
                <p className='text-base'>
                  Our Service may integrate with third-party platforms to enhance functionality, such as enabling you to share your video reels on social media. By using our Service, you agree to comply with the terms and conditions, including privacy policies, of any third-party services with which we integrate.
                </p>
                <ul className='list-disc pl-6 space-y-2'>
                  <li>Responsibility: You are solely responsible for managing your interactions with these third-party platforms.</li>
                  <li>No Endorsement: The inclusion of any third-party service does not imply endorsement by Reelty.</li>
                </ul>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>13. Managing Third-Party Account Access</h2>
                <p className='text-base'>
                  If you choose to link your external accounts (such as social media profiles) with Reelty, you grant us permission to access certain data from those accounts to facilitate integration. You can manage or revoke this access at any time by:
                </p>
                <ul className='list-disc pl-6 space-y-2'>
                  <li>Visiting the respective platform's account permissions or privacy settings page.</li>
                  <li>Logging out directly from the Reelty interface, where available.</li>
                </ul>
                <p className='mt-4'>
                  Please note that revoking such access may limit your ability to use certain features of our Service.
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>14. Contact Information</h2>
                <p className='text-base'>
                  If you have any questions or concerns regarding these Terms, please contact us at:
                </p>
                <p className='mt-2'>
                  Zero21 Media LLC (dba Reelty)<br />
                  Email: info@reelty.io
                </p>
              </section>

              <section className='space-y-3 md:space-y-4'>
                <h2 className='text-xl md:text-2xl font-semibold'>15. Entire Agreement</h2>
                <p className='text-base'>
                  These Terms constitute the entire agreement between you and Zero21 Media LLC regarding your use of our Service and supersede any prior agreements or understandings, whether written or oral, regarding the subject matter herein.
                </p>
              </section>
            </div>

            {/* Closing message */}
            <p className='text-gray-600 pt-4'>
              Thank you for choosing Reelty. We are committed to providing a high-quality, innovative service while ensuring transparency, fairness, and the utmost protection of your rights and content.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
