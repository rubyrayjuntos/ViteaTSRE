import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react"; // Added 'within'
import CodeReviewChecklist from "@/components/CodeReviewChecklist";
import { SECTIONS } from "@/data/checklistData";

describe("CodeReviewChecklist", () => {
  // Define constants for easier access to test data
  const reactSection = SECTIONS.find((s) => s.key === "react");
  const firstReactItemTitle = reactSection?.items[0]?.title; // Use optional chaining for safety

  // Optional: common setup
  beforeEach(() => {
    render(<CodeReviewChecklist />);
  });

  it("toggles a section closed and open", () => {
    // Use the same selector strategy (getByText) for consistency across tests
    const sectionHeader = screen.getByText('React Components');

    // Initially expanded (first item visible within the section)
    // Use `within` to scope queries to a specific element if you have multiple sections
    const reactSectionElement = screen.getByText('React Components').closest('[data-testid="section-react"]'); // Assuming you add data-testid to your section container
    expect(within(reactSectionElement!).getByText(firstReactItemTitle!)).toBeInTheDocument();

    fireEvent.click(sectionHeader);
    // Collapsed – first item not rendered (queryBy is good here)
    expect(screen.queryByText(firstReactItemTitle!)).not.toBeInTheDocument();

    fireEvent.click(sectionHeader);
    // Expanded again
    expect(within(reactSectionElement!).getByText(firstReactItemTitle!)).toBeInTheDocument();
  });

  it("marks an item complete and updates progress for its section", () => {
    const itemText = "Components follow single responsibility principle";
    const item = screen.getByText(itemText);

    // Assuming you have a data-testid on your progress bar or a more unique label
    // If not, you might need to make the component more test-friendly or refine the query
    // Let's get the parent section to find its specific progress label
    const reactSectionElement = screen.getByText(itemText).closest('[data-testid="section-react"]');
    const progressLabel = within(reactSectionElement!).getByText(/%\s*$/i); // Scoped query

    const initialPercent = progressLabel.textContent;
    fireEvent.click(item);

    // Calculate expected percentage for a more robust assertion
    const reactSectionData = SECTIONS.find((s) => s.key === "react")!;
    const totalItemsInReactSection = reactSectionData.items.length;
    // Assuming initially 0 items are complete in this section, clicking one makes it 1 complete
    const expectedNewPercentage = Math.round((1 / totalItemsInReactSection) * 100) + "%";

    expect(progressLabel.textContent).toBe(expectedNewPercentage);
    expect(item).toHaveClass("line-through");

    // Optional: Test marking it incomplete (if your component supports it)
    fireEvent.click(item);
    expect(progressLabel.textContent).toBe(initialPercent); // Back to initial (0%)
    expect(item).not.toHaveClass("line-through");
  });

  // Example of a new test for another section's independence
  it("marking an item in one section does not affect other sections' progress", () => {
    const itemTextReact = "Components follow single responsibility principle";
    const itemTextHtml = "Semantic HTML elements are used appropriately"; // Assuming this is in another section

    const reactItem = screen.getByText(itemTextReact);
    const htmlItem = screen.getByText(itemTextHtml);

    const reactSectionElement = screen.getByText(itemTextReact).closest('[data-testid="section-react"]');
    const htmlSectionElement = screen.getByText(itemTextHtml).closest('[data-testid="section-html"]');

    const reactProgressLabel = within(reactSectionElement!).getByText(/%\s*$/i);
    const htmlProgressLabel = within(htmlSectionElement!).getByText(/%\s*$/i);

    const initialReactProgress = reactProgressLabel.textContent;
    const initialHtmlProgress = htmlProgressLabel.textContent;

    fireEvent.click(reactItem);

    // Expect react section progress to change
    expect(reactProgressLabel.textContent).not.toBe(initialReactProgress);
    // Expect HTML section progress to remain the same
    expect(htmlProgressLabel.textContent).toBe(initialHtmlProgress);
  });
});