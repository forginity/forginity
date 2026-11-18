import { usernameSchema } from "./auth";

export type UsernameCheckState =
  | { status: "idle" }
  | { status: "checking"; candidate: string }
  | { status: "available"; username: string }
  | { status: "taken"; username: string; message: string }
  | { status: "error"; candidate: string; message: string };

export const USERNAME_TAKEN_MESSAGE =
  "This username is already taken. Try another one.";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isUsernameVerifiedFor(
  state: UsernameCheckState,
  rawInput: string
): boolean {
  const normalized = normalizeUsername(rawInput);
  return (
    normalized.length > 0 &&
    state.status === "available" &&
    state.username === normalized
  );
}

export function getUsernameError(
  state: UsernameCheckState
): string | undefined {
  if (state.status === "taken" || state.status === "error") {
    return state.message;
  }
  return undefined;
}

export async function resolveUsernameVerification(
  rawInput: string,
  checkFn: (
    normalized: string
  ) => Promise<{ available: boolean; username: string }>
): Promise<UsernameCheckState> {
  const parsed = usernameSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      status: "error",
      candidate: normalizeUsername(rawInput),
      message: parsed.error.issues[0]?.message ?? "Please enter a valid username",
    };
  }

  const normalized = parsed.data;
  try {
    const response = await checkFn(normalized);
    const resolvedUsername = normalizeUsername(response.username || normalized);
    if (response.available) {
      return {
        status: "available",
        username: resolvedUsername,
      };
    }
    return {
      status: "taken",
      username: resolvedUsername,
      message: USERNAME_TAKEN_MESSAGE,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Unable to verify username availability. Please try again.";
    return {
      status: "error",
      candidate: normalized,
      message,
    };
  }
}
