import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("renders initials from a two-word name", () => {
    render(<Avatar name="Ana Torres" />);
    expect(screen.getByText("AT")).toBeInTheDocument();
  });

  it("renders a single initial for a one-word name", () => {
    render(<Avatar name="Cher" />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("falls back to a question mark for an empty name", () => {
    render(<Avatar name="   " />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("applies the given background color", () => {
    render(<Avatar name="Ana Torres" color="#14b8a6" />);
    expect(screen.getByTitle("Ana Torres")).toHaveStyle({ backgroundColor: "#14b8a6" });
  });
});
