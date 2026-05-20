// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import { DocsModal } from "@/components/DocsModal";

afterEach(() => {
  cleanup();
});

describe("DocsModal", () => {
  it("renders the book icon trigger button", () => {
    render(<DocsModal />);
    expect(
      screen.queryByRole("button", { name: /open documentation/i }),
    ).not.toBeNull();
  });

  it("modal is not visible before the trigger is clicked", () => {
    render(<DocsModal />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("clicking the trigger opens the modal with Introduction tab active by default", () => {
    render(<DocsModal />);

    fireEvent.click(
      screen.getByRole("button", { name: /open documentation/i }),
    );

    expect(screen.queryByRole("dialog")).not.toBeNull();
    expect(screen.queryByRole("tab", { name: "Introduction" })).not.toBeNull();
    expect(
      screen.queryByText(/prompt engineering is the process/i),
    ).not.toBeNull();
  });

  it("clicking Tips tab shows its content", () => {
    render(<DocsModal />);
    fireEvent.click(
      screen.getByRole("button", { name: /open documentation/i }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "Tips" }));

    expect(screen.queryByText(/general tips/i)).not.toBeNull();
  });

  it("clicking Sources tab shows its content", () => {
    render(<DocsModal />);
    fireEvent.click(
      screen.getByRole("button", { name: /open documentation/i }),
    );

    fireEvent.click(screen.getByRole("tab", { name: /sources/i }));

    expect(screen.queryByText(/guides & courses/i)).not.toBeNull();
  });
});
