import bookingApi from "../api/booking";

// Nitro/Unctx compatible handler.
// This ensures POST /api/booking works (instead of falling back to the SSR 404 page).
export async function post(req: Request): Promise<Response> {
  // Match booking.ts expected req.json()
  const body = await req.json().catch(() => null);

  const fakeReq = {
    method: "POST",
    json: async () => body,
  };

  // bookingApi returns a Response already
  return (bookingApi as any)(fakeReq);
}

