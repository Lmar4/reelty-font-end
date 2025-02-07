export async function POST(request: Request) {
  const { userId, priceId, successUrl, cancelUrl } = await request.json();

  // Placeholder response for future Stripe configuration
  return new Response(
    JSON.stringify({ message: "Stripe configuration is pending." }),
    {
      status: 501, // Not Implemented
      headers: { "Content-Type": "application/json" },
    }
  );
}
