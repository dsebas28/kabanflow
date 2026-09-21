import { describe, expect, it } from "vitest";
import { createBoardSchema, registerSchema, reorderSchema, updateCardSchema } from "./validation";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({ name: "Ana Torres", email: "ana@example.com", password: "demo1234" });
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({ name: "Ana", email: "ana@example.com", password: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ name: "Ana", email: "not-an-email", password: "demo1234" });
    expect(result.success).toBe(false);
  });

  it("trims the name", () => {
    const result = registerSchema.safeParse({ name: "  Ana  ", email: "ana@example.com", password: "demo1234" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Ana");
  });
});

describe("createBoardSchema", () => {
  it("requires a non-empty title", () => {
    expect(createBoardSchema.safeParse({ title: "" }).success).toBe(false);
    expect(createBoardSchema.safeParse({ title: "Sprint 1" }).success).toBe(true);
  });
});

describe("updateCardSchema", () => {
  it("allows clearing the description with null", () => {
    const result = updateCardSchema.safeParse({ description: null });
    expect(result.success).toBe(true);
  });

  it("rejects a non-cuid listId", () => {
    const result = updateCardSchema.safeParse({ listId: "not-a-cuid" });
    expect(result.success).toBe(false);
  });
});

describe("reorderSchema", () => {
  it("accepts one or two lists", () => {
    const oneList = reorderSchema.safeParse({ lists: [{ id: "clh3am1x50000qzrm2f9x1g8a", cardIds: [] }] });
    expect(oneList.success).toBe(true);
  });

  it("rejects more than two lists", () => {
    const id = "clh3am1x50000qzrm2f9x1g8a";
    const result = reorderSchema.safeParse({ lists: [{ id, cardIds: [] }, { id, cardIds: [] }, { id, cardIds: [] }] });
    expect(result.success).toBe(false);
  });

  it("rejects a non-cuid card id", () => {
    const result = reorderSchema.safeParse({
      lists: [{ id: "clh3am1x50000qzrm2f9x1g8a", cardIds: ["not-a-cuid"] }],
    });
    expect(result.success).toBe(false);
  });
});
