import Footer from "@/components/reelty/Footer";

export default function Terms() {
  return (
    <>
      <div className='max-w-[1200px] mx-auto px-4 py-8 min-h-screen flex flex-col justify-between'>
        <div className='prose prose-gray max-w-none'>
          <h1 className='text-[40px] font-semibold text-[#1c1c1c] mb-8'>
            Terms of Service
          </h1>
          {/* Add your terms of service content here */}
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Reelty. By using our service, you agree to these terms.
            Please read them carefully.
          </p>

          <h2>2. Using our Services</h2>
          <p>
            You must follow any policies made available to you within the
            Services.
          </p>

          <h2>3. Privacy</h2>
          <p>
            Reelty's privacy policies explain how we treat your personal data
            and protect your privacy when you use our Services.
          </p>

          {/* Add more sections as needed */}
        </div>
      </div>
      <Footer />
    </>
  );
}
