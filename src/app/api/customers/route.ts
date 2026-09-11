import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, parseSearch, withAuth } from "@/lib/http";
import {
  createCustomer,
  customerInputSchema,
  listCustomers,
} from "@/lib/services/customers";

export async function GET(request: Request) {
  return withAuth(async () => {
    const db = await getReadyDb();
    const customers = await listCustomers(db, parseSearch(request).get("q") ?? undefined);
    return Response.json({ customers });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, customerInputSchema);
      const db = await getReadyDb();
      const customer = await createCustomer(db, user, body);
      return Response.json({ customer }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
