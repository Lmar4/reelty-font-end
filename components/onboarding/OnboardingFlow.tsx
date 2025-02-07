import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PlanSelection from "./PlanSelection";

type OnboardingStep = "welcome" | "plan-selection" | "complete";

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const router = useRouter();

  const steps = {
    welcome: {
      title: "Welcome to Reelty!",
      description: "Let's get you set up with the perfect plan for your needs.",
      progress: 33,
    },
    "plan-selection": {
      title: "Choose Your Plan",
      description: "Select the plan that best fits your business needs.",
      progress: 66,
    },
    complete: {
      title: "All Set!",
      description: "Your account is ready to use.",
      progress: 100,
    },
  };

  const handleNext = () => {
    if (currentStep === "welcome") setCurrentStep("plan-selection");
    else if (currentStep === "plan-selection") setCurrentStep("complete");
    else router.push("/dashboard");
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <Card className='w-full max-w-2xl p-8 space-y-6'>
        <Progress value={steps[currentStep].progress} className='w-full' />

        <div className='space-y-4'>
          <h1 className='text-2xl font-bold text-gray-900'>
            {steps[currentStep].title}
          </h1>
          <p className='text-gray-600'>{steps[currentStep].description}</p>
        </div>

        {currentStep === "welcome" && (
          <div className='space-y-4'>
            <p className='text-sm text-gray-500'>
              We'll guide you through setting up your account and choosing the
              perfect plan.
            </p>
            <Button onClick={handleNext} className='w-full'>
              Start Onboarding
            </Button>
          </div>
        )}

        {currentStep === "plan-selection" && (
          <div className='space-y-4'>
            <PlanSelection onSelect={handleNext} />
          </div>
        )}

        {currentStep === "complete" && (
          <div className='space-y-4'>
            <p className='text-sm text-gray-500'>
              Your account is all set up! You can now start using Reelty.
            </p>
            <Button onClick={handleNext} className='w-full'>
              Go to Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
