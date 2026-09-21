import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordStrength, { scorePassword } from "./PasswordStrength";

describe("scorePassword", () => {
  it("rates passwords under 6 characters as too short", () => {
    expect(scorePassword("abc")).toBe(0);
  });

  it("rates a short lowercase password as weak", () => {
    expect(scorePassword("abcdef")).toBe(1);
  });

  it("rewards length, mixed case, and digits with symbols", () => {
    expect(scorePassword("abcdefghij")).toBe(2);
    expect(scorePassword("Abcdefghij")).toBe(3);
    expect(scorePassword("Abcdefgh1!")).toBe(4);
  });
});

describe("PasswordStrength", () => {
  it("renders nothing for an empty password", () => {
    const { container } = render(<PasswordStrength password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the strength label", () => {
    render(<PasswordStrength password="Abcdefgh1!" />);
    expect(screen.getByText("Fuerte")).toBeInTheDocument();
  });
});
