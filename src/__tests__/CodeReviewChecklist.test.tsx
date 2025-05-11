import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import CodeReviewChecklist from "@/components/CodeReviewChecklist";
import { SECTIONS } from "@/data/checklistData";

describe("CodeReviewChecklist", () => {
  it("toggles a section closed and open", () => {
    render(<CodeReviewChecklist />);

    const sectionHeader = screen.getByText("React Components");
    // initially expanded (progress bar visible)
    expect(
      screen.getByText(SECTIONS.find((s) => s.key === "react")!.items[0].title),
    ).toBeInTheDocument();

    fireEvent.click(sectionHeader);
    // collapsed – first item not rendered
    expect(
      screen.queryByText(
        SECTIONS.find((s) => s.key === "react")!.items[0].title,
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(sectionHeader);
    // expanded again
    expect(
      screen.getByText(SECTIONS.find((s) => s.key === "react")!.items[0].title),
    ).toBeInTheDocument();
  });

  it("marks an item complete and updates progress", () => {
    render(<CodeReviewChecklist />);
    const item = screen.getByText("Components follow single responsibility principle");
    const progressLabel = screen.getAllByText(/%\s*$/i)[0]; // first section's %

    const initialPercent = progressLabel.textContent;
    fireEvent.click(item);
    expect(progressLabel.textContent).not.toBe(initialPercent);
    // strike‑through confirms completion UI
    expect(item).toHaveClass("line-through");
  });
});
