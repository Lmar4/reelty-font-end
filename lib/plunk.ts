import Plunk from "@plunk/node";
import { render } from "@react-email/render";
import { CreditPurchaseEmail } from "@/emails/CreditPurchaseEmail";
import { LowBalanceEmail } from "@/emails/LowBalanceEmail";
import { SubscriptionChangeEmail } from "@/emails/SubscriptionChangeEmail";
import { PaymentFailureEmail } from "@/emails/PaymentFailureEmail";

if (!process.env.PLUNK_PUBLIC_API_KEY) {
  throw new Error("Missing PLUNK_PUBLIC_API_KEY environment variable");
}

export const plunk = new Plunk(process.env.PLUNK_PUBLIC_API_KEY);

// Email sending utility functions
export const sendWelcomeEmail = async (email: string, name: string) => {
  await plunk.emails.send({
    to: email,
    subject: "Welcome to Reelty!",
    body: `Welcome to Reelty, ${name}! We're excited to have you on board.`,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
) => {
  await plunk.emails.send({
    to: email,
    subject: "Reset Your Password",
    body: `Click the following link to reset your password: ${resetLink}`,
  });
};

export const sendVerificationEmail = async (
  email: string,
  verifyLink: string
) => {
  await plunk.emails.send({
    to: email,
    subject: "Verify Your Email",
    body: `Please verify your email by clicking this link: ${verifyLink}`,
  });
};

// Credit-related email functions
export const sendCreditPurchaseEmail = async (
  email: string,
  name: string,
  credits: number,
  amount: number
) => {
  const purchaseDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const emailHtml = render(
    CreditPurchaseEmail({
      name,
      credits,
      amount,
      purchaseDate,
    })
  );

  await plunk.emails.send({
    to: email,
    subject: "Credit Purchase Confirmation - Reelty",
    body: emailHtml,
  });
};

export const sendLowBalanceEmail = async (
  email: string,
  name: string,
  remainingCredits: number,
  expiryDate?: string
) => {
  const emailHtml = render(
    LowBalanceEmail({
      name,
      remainingCredits,
      expiryDate,
    })
  );

  await plunk.emails.send({
    to: email,
    subject: "Low Credit Balance Alert - Reelty",
    body: emailHtml,
  });
};

// Credit monitoring function
export const checkAndNotifyLowBalance = async (
  email: string,
  name: string,
  credits: number,
  expiryDate?: string,
  threshold: number = 5 // Default threshold of 5 credits
) => {
  if (credits <= threshold) {
    await sendLowBalanceEmail(email, name, credits, expiryDate);
    return true;
  }
  return false;
};

export const sendSubscriptionChangeEmail = async (
  email: string,
  firstName: string,
  oldPlanName: string,
  newPlanName: string,
  oldPlanPrice: number,
  newPlanPrice: number,
  newFeatures: string[],
  effectiveDate: string,
  nextBillingDate: string
) => {
  const priceDifference = Math.abs(newPlanPrice - oldPlanPrice);
  const isUpgrade = newPlanPrice > oldPlanPrice;

  const emailHtml = render(
    SubscriptionChangeEmail({
      firstName,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.reelty.com",
      oldPlanName,
      newPlanName,
      oldPlanPrice,
      newPlanPrice,
      priceDifference,
      isUpgrade,
      newFeatures,
      effectiveDate,
      nextBillingDate,
    })
  );

  await plunk.emails.send({
    to: email,
    subject: `Your Reelty Subscription Has Been ${
      isUpgrade ? "Upgraded" : "Changed"
    } to ${newPlanName}`,
    body: emailHtml,
  });
};

export const sendPaymentFailureEmail = async (
  email: string,
  firstName: string,
  planName: string,
  amount: number,
  failureReason: string,
  nextAttemptDate?: string,
  paymentMethodLast4?: string
) => {
  const emailHtml = render(
    PaymentFailureEmail({
      firstName,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.reelty.com",
      planName,
      amount,
      failureReason,
      nextAttemptDate,
      paymentMethodLast4,
    })
  );

  await plunk.emails.send({
    to: email,
    subject: "Action Required: Payment Failed - Reelty Subscription",
    body: emailHtml,
  });
};
