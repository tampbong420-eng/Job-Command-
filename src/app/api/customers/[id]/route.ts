import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import {
  customerInputSchema,
  deleteCustomer,
  getCustomer,
  updateCustomer,
} from "@/lib/services/customers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async () => {
    const db = await getReadyDb();
    const customer = await getCustomer(db, id);
    return Response.json({ customer });
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, customerInputSchema);
      const db = await getReadyDb();
      const customer = await updateCustomer(db, user, id, body);
      return Response.json({ customer });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return withAuth(async (user) => {
    const db = await getReadyDb();
    await deleteCustomer(db, user, id);
    return Response.json({ ok: true });
  });
}
