import availabilityApi from "./availability";

// Handles GET /api/availability
export async function get(req: Request): Promise<Response> {
  return availabilityApi(req);
}

export default async function handler(req: Request): Promise<Response> {
  return availabilityApi(req);
}
