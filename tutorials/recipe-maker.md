# Recipe Maker

## What You'll Build

In this tutorial, you'll be building an agent to process a comma-separated dataset (CSV), filter it, and generate 3 recipes for you based on the result.

### Agents Used

- `Personal Chef`

### Prerequisites

- Access to an Large Language Model (LMM) or Large Multimodal Model (LMM) with internet access. Claude, Gemini, ChatGPT, and many others have these capabilities.
- A text editor
- 15-60 minutes of free time

### Additional Notes

- The data for this tutorial is from [OpenNutrition](https://www.opennutrition.app/). This subset used in this project was filtered using `type = everyday` and `protein per 100g >= 15`.
- These recipes might be delicious or hilariously bad

## Agent Setup

1. Open Llamanomicon
2. Either create an agent or use the existing `Personal Chef`
3. Toggle on or off snippets which are relevant to this task
4. Save your changes and copy the prompt to your text editor
5. Note: Now is a good time to export your data if you'd like to keep a permanent copy of these agents

## Building the prompt

With the Llamanomicon prompt done, the final step is adding additional context. This could be adding a role, explaining the expected output format, or adding important bits of information.

### Example Context

Here's the prompt I used:

```md
You are a master chef tasked with creating three recipes for the day.

Each recipe should be in a section. Each section should have ingredient measurements, clear prep and cooking steps, and a nutrition label for each serving.

These are very common ingredients so there should be tons of delicious recipes which alreayd exist.
```

### Optional: Refinement

Reviewing your prompt with an LLM can help highlight blindspots, let you discuss major trade-offs, or explain certain parts in more detail to make an objective clearer.

To do this, copy the `Prompt Improver` and your prompt file into your LLM of choice (in a new chat).

This will generate multiple variations of your prompt and provide suggestions. Keep refining, then copy the result back into your text editor.

You can always tell it to `Take the approved changes and recommendations from this chat and generate a llm-optimized prompt`.

## Start the Meal Planning

Attach the [protein_sources.csv](./protein_sources.csv) file, your prompt, and kick off the task in a new conversation!

## Analyze the Results

You should now have three recipes! Deliciousness may vary...

Would you try any of them?

## Extra Credit

- Add a step so the agent researches highly rated recipes using the ingredient
- Add you taste preferences to the initial prompt
- Add other nutrition filtering criteria, such as fiber, sugar, or omega oils
- Add a check for potential health risks, such as too many fat soluable vitamins
