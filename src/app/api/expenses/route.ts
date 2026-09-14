import { getReadyDb } from "@/db";
import { errorResponse } from "@/lib/errors";
import { parseBody, withAuth } from "@/lib/http";
import { createExpense, expenseCreateSchema, listExpenses } from "@/lib/services/expenses";

export async function GET() {
  return withAuth(async (user) => {
    const db = await getReadyDb();
    const expenses = await listExpenses(db, user);
    return Response.json({ expenses });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const body = await parseBody(request, expenseCreateSchema);
      const db = await getReadyDb();
      const expense = await createExpense(db, user, body);
      return Response.json({ expense }, { status: 201 });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
