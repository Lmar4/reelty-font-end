import Footer from "@/components/reelty/Footer";
export default function Privacy() {
  return (
    <>
      <div className='max-w-[1200px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-between'>
        <div className='prose prose-gray max-w-none'>
          <h1 className='text-[40px] font-semibold text-[#1c1c1c] mb-8'>
            Reelty Privacy Policy
          </h1>
          <p className='mb-8'>Last updated: 02/13/2025</p>

          <h2 className='text-2xl font-semibold mb-4'>1. Introduction</h2>
          <p className='mb-6'>
            Reelty ("we", "us", "our") is a real estate media service operated
            by 021 Media LLC. We are committed to protecting your personal data
            and respecting your privacy. This Privacy Policy explains how we
            collect, use, store, and share your information when you visit our
            website or use our services, and informs you about your rights under
            applicable laws—including the California Consumer Privacy Act (CCPA)
            and, where applicable, the General Data Protection Regulation
            (GDPR).
          </p>

          <h2 className='text-2xl font-semibold mb-4'>
            2. What Data Do We Collect?
          </h2>
          <p className='mb-4'>
            We may collect, use, store, and transfer various types of personal
            data about you, which we have grouped as follows:
          </p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              <span className='font-semibold'>Identity Data:</span> Your first
              name, last name, username, or other identifiers you provide.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Contact Data:</span> Your email
              address, telephone number, and mailing address.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Property & Listing Data:</span>{" "}
              Information related to your real estate listings, including
              photos, property descriptions, location details, and other listing
              information you provide for creating your video reels.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Technical Data:</span> Details
              such as your IP address, browser type, operating system, device
              information, and usage data collected automatically as you
              interact with our services.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Payment Data:</span> Credit/debit
              card details, billing information, and transaction history
              processed via our secure payment systems.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Communication Data:</span> Any
              information you provide when you contact our customer support or
              correspond with us.
            </li>
          </ul>

          <h2 className='text-2xl font-semibold mb-4'>
            3. How Do We Collect Your Data?
          </h2>
          <p className='mb-4'>
            We collect data about you in various ways, including:
          </p>
          <ul className='list-disc pl-6 mb-6'>
            <li className='mb-2'>
              <span className='font-semibold'>Direct Interactions:</span> When
              you fill out forms, register an account, upload property photos,
              submit listing details, or communicate with us via email, phone,
              or postal mail.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Automated Technologies:</span> As
              you use our website or services, we automatically gather Technical
              Data via cookies, server logs, and similar tracking technologies.
            </li>
            <li className='mb-2'>
              <span className='font-semibold'>Third-Party Sources:</span> We may
              receive data about you from trusted third parties—such as payment
              processors, analytics providers, or service integrations—that help
              us deliver and improve our services.
            </li>
          </ul>

          {/* Continuing with remaining sections... */}
          <h2 className='text-2xl font-semibold mb-4'>14. How to Contact Us</h2>
          <p className='mb-4'>
            If you have any questions or concerns about this Privacy Policy, our
            data practices, or if you wish to exercise your data protection
            rights, please contact us:
          </p>
          <p className='mb-6'>
            021 Media LLC (dba Reelty)
            <br />
            Email: info@reelty.com
          </p>

          <p className='mb-8'>
            Thank you for choosing Reelty. We are dedicated to safeguarding your
            privacy and ensuring a secure, transparent service experience while
            respecting your rights and the ownership of your media.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
