import Plunk from "@plunk/node";
import { render } from "@react-email/render";

import { SubscriptionChangeEmail } from "@/emails/SubscriptionChangeEmail";
import { PaymentFailureEmail } from "@/emails/PaymentFailureEmail";
import CreditPurchaseEmail from "@/emails/CreditPurchaseEmail";
import LowBalanceEmail from "@/emails/LowBalanceEmail";
import VideoGeneratedEmail from "@/emails/VideoGeneratedEmail";

if (!process.env.PLUNK_PUBLIC_API_KEY) {
  throw new Error("Missing PLUNK_PUBLIC_API_KEY environment variable");
}

export const plunk = new Plunk(process.env.PLUNK_PUBLIC_API_KEY);

// Types for agency-related emails
export interface SendInviteEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  inviteLink: string;
  initialCredits: number;
}

export interface SendWelcomeEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  loginLink: string;
}

export interface SendCreditUpdateEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  agencyName: string;
  creditsAdded: number;
  totalCredits: number;
  reason?: string;
}

// Agency-related email functions
export const sendAgencyInviteEmail = async ({
  to,
  firstName,
  lastName,
  agencyName,
  inviteLink,
  initialCredits,
}: SendInviteEmailParams) => {
  try {
    await plunk.emails.send({
      to,
      subject: "Agency Invitation",
      body: `Hi ${firstName},\n\nYou've been invited to join ${agencyName} with ${initialCredits} initial credits.\nClick here to join: ${inviteLink}`,
    });
  } catch (error) {
    console.error("[SEND_INVITE_EMAIL]", error);
    throw new Error("Failed to send invite email");
  }
};

export const sendAgencyWelcomeEmail = async ({
  to,
  firstName,
  lastName,
  agencyName,
  loginLink,
}: SendWelcomeEmailParams) => {
  try {
    await plunk.emails.send({
      to,
      subject: "Welcome to Your Agency Account",
      body: `Hi ${firstName},\n\nWelcome to ${agencyName}!\nClick here to login: ${loginLink}`,
    });
  } catch (error) {
    console.error("[SEND_WELCOME_EMAIL]", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendCreditUpdateEmail = async ({
  to,
  firstName,

  agencyName,
  creditsAdded,
  totalCredits,
  reason,
}: SendCreditUpdateEmailParams) => {
  try {
    await plunk.emails.send({
      to,
      subject: "Credit Update Notification",
      body: `Hi ${firstName},\n\nYour credits have been updated at ${agencyName}.\nCredits added: ${creditsAdded}\nTotal credits: ${totalCredits}\nReason: ${
        reason || "manual update"
      }`,
    });
  } catch (error) {
    console.error("[SEND_CREDIT_UPDATE_EMAIL]", error);
    throw new Error("Failed to send credit update email");
  }
};

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
  currentBalance: number,
  currency: string
) => {
  const emailHtml = render(
    LowBalanceEmail({
      currentBalance,
      currency,
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
  currentBalance: number,
  currency: string,
  threshold: number = 5 // Default threshold of 5 credits
) => {
  if (currentBalance <= threshold) {
    await sendLowBalanceEmail(email, currentBalance, currency);
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

export const sendVideoGeneratedEmail = async (
  email: string,
  firstName: string,
  listingAddress: string,
  listingId: string
) => {
  try {
    const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings/${listingId}`;

    const emailHtml = render(
      VideoGeneratedEmail({
        firstName,
        listingAddress,
        listingUrl,
      })
    );

    await plunk.emails.send({
      to: email,
      subject: `Your Reelty Videos for ${listingAddress} Are Ready! 🎥`,
      body: emailHtml,
    });
  } catch (error) {
    console.error("[SEND_VIDEO_GENERATED_EMAIL]", error);
    throw new Error("Failed to send video generation email");
  }
};
