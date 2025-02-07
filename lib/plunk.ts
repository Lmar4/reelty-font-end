import Plunk from "@plunk/node";

if (!process.env.PLUNK_API_KEY) {
  throw new Error("Missing PLUNK_API_KEY environment variable");
}

export const plunk = new Plunk(process.env.PLUNK_API_KEY);

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
