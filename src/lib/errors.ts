export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
    readonly code: string = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do that") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown }).issues)
  ) {
    const first = (error as { issues: Array<{ message?: string }> }).issues[0];
    return Response.json(
      { error: first?.message || "Invalid request", code: "VALIDATION" },
      { status: 400 },
    );
  }
  console.error(error);
  return Response.json(
    { error: "Internal server error", code: "INTERNAL" },
    { status: 500 },
  );
}
