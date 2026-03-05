import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth before importing
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { requireAdmin } from "../admin";
import { auth } from "@/lib/auth";

const mockAuth = vi.mocked(auth);

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await requireAdmin();
    expect(result.error).not.toBeNull();
    expect(result.session).toBeNull();
    const body = await result.error!.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);
    const result = await requireAdmin();
    expect(result.error).not.toBeNull();
    expect(result.session).toBeNull();
  });

  it("returns 403 when user is not ADMIN", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as never);
    const result = await requireAdmin();
    expect(result.error).not.toBeNull();
    expect(result.session).toBeNull();
    const body = await result.error!.json();
    expect(body.error).toBe("Forbidden");
  });

  it("returns session when user is ADMIN", async () => {
    const session = { user: { id: "u1", role: "ADMIN" } };
    mockAuth.mockResolvedValue(session as never);
    const result = await requireAdmin();
    expect(result.error).toBeNull();
    expect(result.session).toBe(session);
  });

  it("returns null session on auth failure", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "USER" } } as never);
    const result = await requireAdmin();
    expect(result.session).toBeNull();
  });
});
