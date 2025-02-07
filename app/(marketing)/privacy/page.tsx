import Footer from "@/components/reelty/Footer";
export default function Privacy() {
  return (
    <>
      <div className='max-w-[1200px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-between'>
        <div className='prose prose-gray max-w-none'>
          <h1 className='text-[40px] font-semibold text-[#1c1c1c] mb-8'>
            Privacy Policy
          </h1>
          {/* Add your privacy policy content here */}
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information to provide better services to our users.</p>

          <h2>2. How We Use Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services.
          </p>

          <h2>3. Information Security</h2>
          <p>
            We work hard to protect our users from unauthorized access to or
            unauthorized alteration, disclosure, or destruction of information
            we hold.
          </p>

          {/* Add more sections as needed */}
        </div>
      </div>
      <Footer />
    </>
  );
}
