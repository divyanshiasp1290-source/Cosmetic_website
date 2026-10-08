import createCheckoutSession from "../../api/create-checkout-session";

// Handles POST /api/create-checkout-session
export async function post(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null);

  const fakeReq = {
    method: "POST",
    json: async () => body,
  };

  return (createCheckoutSession as any)(fakeReq, {});
}
