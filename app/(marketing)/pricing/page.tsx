import PricingCards from "@/components/reelty/PricingCards";

export default function Pricing() {
  return (
    <div className='max-w-[1200px] mx-auto px-4 py-8'>
      <div className='text-center mb-10'>
        <h1 className='text-[60px] font-semibold text-[#1c1c1c] mb-4'>Plans</h1>
        <p className='text-[18px] text-[#6B7280]'>
          No hidden fees. Cancel anytime.
        </p>
      </div>
      <PricingCards />
    </div>
  );
}
