// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import { PromptStructure } from "@/components/PromptStructure";
import { PromptOutput } from "@/components/PromptOutput";
import { useAppStore } from "@/store/useAppStore";
import type { Agent, Snippet, Skill } from "@/types";

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "Test Agent",
    activeSet: new Set(),
    ...overrides,
  };
}

const skillA: Skill = { id: "sA", name: "Alpha" };

const snip1: Snippet = {
  id: "n1",
  name: "Snippet One",
  text: "Hello",
  skills: new Set(["sA"]),
};
const snip2: Snippet = {
  id: "n2",
  name: "Snippet Two",
  text: "World",
  skills: new Set(["sA"]),
};

beforeEach(() => {
  useAppStore.setState({
    activeAgentId: null,
    snippets: new Map(),
    skills: new Map(),
    agents: new Map(),
    baseline: {
      snippets: new Map(),
      skills: new Map(),
      agents: new Map(),
    },
    snippetsBySkill: new Map(),
    outputSettings: { theme: "light" },
  });
});

afterEach(() => {
  cleanup();
});

describe("OutputStructure", () => {
  it('shows "Select an agent" empty state when no active agent', () => {
    render(<PromptStructure />);
    expect(screen.queryByText("Select an agent to get started")).not.toBeNull();
  });

  it('shows "Toggle snippets" empty state when agent has no active snippets', () => {
    const agent = makeAgent();
    useAppStore.setState({
      activeAgentId: agent.id,
      snippets: new Map(),
      skills: new Map(),
      agents: new Map([[agent.id, agent]]),
    });
    render(<PromptStructure />);
    expect(
      screen.queryByText("Toggle snippets to build your prompt"),
    ).not.toBeNull();
  });

  it("renders one accordion section per skill that has active snippets", () => {
    const agent = makeAgent({
      activeSet: new Set(["n1", "n2"]),
    });
    useAppStore.setState({
      activeAgentId: agent.id,
      snippets: new Map([
        ["n1", snip1],
        ["n2", snip2],
      ]),
      skills: new Map([["sA", skillA]]),
      agents: new Map([[agent.id, agent]]),
      snippetsBySkill: new Map([["sA", new Set(["n1", "n2"])]]),
    });
    render(<PromptStructure />);
    expect(screen.queryByText("Alpha")).not.toBeNull();
    expect(screen.queryByText("Snippet One")).not.toBeNull();
    expect(screen.queryByText("Snippet Two")).not.toBeNull();
  });

  it("applies output glow variant to panel card when compiled output is non-empty", () => {
    const agent = makeAgent({ activeSet: new Set(["n1"]) });
    useAppStore.setState({
      activeAgentId: agent.id,
      snippets: new Map([["n1", snip1]]),
      skills: new Map([["sA", skillA]]),
      agents: new Map([[agent.id, agent]]),
      snippetsBySkill: new Map([["sA", new Set(["n1"])]]),
    });

    const { container } = render(<PromptStructure />);
    const panelCard = container.firstElementChild;

    expect(panelCard?.getAttribute("data-tour-target")).toBe("output");
  });

  it("does not apply output glow variant to panel card when output is empty", () => {
    const { container } = render(<PromptStructure />);
    const panelCard = container.firstElementChild;

    const styleAttr = panelCard?.getAttribute("style") ?? "";
    expect(styleAttr).not.toContain("var(--panel-output-shadow)");
  });

  it("all accordion sections are expanded by default", () => {
    const skillB: Skill = { id: "sB", name: "Beta" };
    const snip3: Snippet = {
      id: "n3",
      name: "Snippet Three",
      text: "Z",
      skills: new Set(["sB"]),
    };
    const agent = makeAgent({
      activeSet: new Set(["n1", "n3"]),
    });
    useAppStore.setState({
      activeAgentId: agent.id,
      snippets: new Map([
        ["n1", snip1],
        ["n3", snip3],
      ]),
      skills: new Map([
        ["sA", skillA],
        ["sB", skillB],
      ]),
      agents: new Map([[agent.id, agent]]),
      snippetsBySkill: new Map([
        ["sA", new Set(["n1"])],
        ["sB", new Set(["n3"])],
      ]),
    });
    render(<PromptStructure />);
    expect(screen.queryByText("Alpha")).not.toBeNull();
    expect(screen.queryByText("Beta")).not.toBeNull();
    expect(screen.queryByText("Snippet One")).not.toBeNull();
    expect(screen.queryByText("Snippet Three")).not.toBeNull();
  });

  it("header section has no copy buttons", () => {
    render(<PromptStructure />);
    const heading = screen.getByText("Structure");
    const headerDiv = heading.closest("div");
    const buttonsInHeader = headerDiv?.querySelectorAll("button") ?? [];
    expect(buttonsInHeader.length).toBe(0);
  });
});

describe("RawOutput", () => {
  it("renders the Prompt title", () => {
    render(<PromptOutput />);
    expect(screen.queryByText("Prompt")).not.toBeNull();
  });

  it("toggle switches pre content between XML and plain text", () => {
    const agent = makeAgent({ activeSet: new Set(["n1"]) });
    useAppStore.setState({
      activeAgentId: agent.id,
      snippets: new Map([["n1", snip1]]),
      skills: new Map([["sA", skillA]]),
      agents: new Map([[agent.id, agent]]),
      snippetsBySkill: new Map([["sA", new Set(["n1"])]]),
    });
    const { container } = render(<PromptOutput />);
    const pre = container.querySelector("pre");

    expect(pre?.textContent).toContain("<alpha>");

    fireEvent.click(screen.getByText("Text"));
    expect(pre?.textContent).toContain("Hello");
    expect(pre?.textContent).not.toContain("<alpha>");

    fireEvent.click(screen.getByText("XML"));
    expect(pre?.textContent).toContain("<alpha>");
  });

  it("copy button copies XML when in XML mode and plain text when in Text mode", () => {
    const writeTextMock = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    const agent = makeAgent({ activeSet: new Set(["n1"]) });
    useAppStore.setState({
      activeAgentId: agent.id,
      snippets: new Map([["n1", snip1]]),
      skills: new Map([["sA", skillA]]),
      agents: new Map([[agent.id, agent]]),
      snippetsBySkill: new Map([["sA", new Set(["n1"])]]),
    });
    render(<PromptOutput />);

    const buttons = screen.getAllByRole("button");
    const copyButton = buttons[buttons.length - 1]!;

    act(() => {
      fireEvent.click(copyButton);
    });
    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining("<alpha>"),
    );

    writeTextMock.mockClear();
    fireEvent.click(screen.getByText("Text"));
    act(() => {
      fireEvent.click(copyButton);
    });
    expect(writeTextMock).toHaveBeenCalledWith("Hello");
  });

  it("copy button is disabled when there is no output", () => {
    render(<PromptOutput />);
    const buttons = screen.getAllByRole("button");
    const copyButton = buttons[buttons.length - 1]!;
    const isDisabled =
      (copyButton as HTMLButtonElement).disabled ||
      copyButton.getAttribute("aria-disabled") === "true";
    expect(isDisabled).toBe(true);
  });
});
