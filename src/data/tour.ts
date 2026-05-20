// introJs.Step is inaccessible via ESM import under verbatimModuleSyntax (export= namespace).
interface TourStep {
  element: string;
  title?: string;
  intro: string;
}

export const tourSteps: TourStep[] = [
  {
    element: "body",
    title: "Welcome to Llamanomicon",
    intro:
      "Let's take a quick tour. You'll see how to build powerful LLM prompts, from reusable snippets, in just a few clicks.",
  },
  {
    element: '[data-tour-target="agents"]',
    title: "Agents",
    intro:
      "Agents are your prompt profiles. The active agent determines what appears in your output.",
  },
  {
    element: '[data-tour-target="skills"]',
    title: "Skills",
    intro:
      "Skills group snippets by topic. Select a skill to filter the Snippets panel.",
  },
  {
    element: '[data-tour-target="snippets"]',
    title: "Snippets",
    intro:
      "Snippets are your reusable text fragments. Toggle them on to include them in the agent's prompt.",
  },
  {
    element: '[data-tour-target="output"]',
    title: "Structure",
    intro:
      "This is a summary of which skills have active snippets for this agent. This is a quick way to see what went into generating the prompt.",
  },
  {
    element: '[data-tour-target="raw-output"]',
    title: "Prompt",
    intro:
      "This is your prompt. Use the XML or Text toggle to switch formats, then hit the copy button to send it to your clipboard.",
  },
  {
    element: '[data-tour-target="session-controls"]',
    title: "Application Controls",
    intro:
      "Save your session, download your data, access documentation, and more!",
  },
  {
    element: "body",
    title: "You're all set!",
    intro:
      "Your workspace is loaded with sample data. Explore the panels, activate some snippets, and copy your first compiled prompt. Happy prompting!",
  },
];
