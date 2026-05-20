# Finding a Used Car

## What You'll Build

In this tutorial you'll prompt an agent to do market research and return its findings as a table of recommended used vehicles. The results will be tailored to your search criteria. The table includes vehicle make, model, year range, estimated price, reliability highlights, and a brief pros/cons summary.

You'll also have a polished and reusable prompt!

### Agents Used

- `Research Assistant`
- `Prompt Improver` (optional)

### Prerequisites

- Access to an Large Language Model (LMM) or Large Multimodal Model (LMM) with internet access. Claude, Gemini, ChatGPT, and many others have these capabilities.
- A text editor
- 15-60 minutes of free time

### Additional Notes

- Depending on the provider and model size, only 5-10 recommendations may be provided in your report. Asking for multiple tables based on a criteria, such as vehicle makes, fuel types, or other characteristics, can help increase the number of recommendations.
- The time of day you run this query might provide different results. This is because high-demand periods can suffer from performance restrictions.
- Vehicles can be fun to drive, reliable, and cheap. You can usually only pick two of these characteristics.
- Recalls, safety bulletins, and lawsuits are good ways to determine which years might be problematic. While you could end up with a lemon, this might slighly help your odds.
- The regular maintenance on the vehicle is one of the most important aspects. You could create a second prompt to review each listing to ensure regular oil changes, highlight worrying maintenance issues, or highlight symptoms of a larger issue.

## Preparation

Clearly framing your problem and expected output is the first step to a good prompt.

What characteristics should this vehicle have? Write this in a format that works best for you.

Write this list in your text editor.

### Filter Example

```md
# Must have

- All-wheel drive vehicle
- Has good odds of lasting at least 200,000 miles
- Requires minimal maintenance over a 10 year period
- Is easy to work on for a home mechanic
- Has an extremely reliable engine and transmission
- Has at least good safety ratings, for all tests, from the Insurance Institute for Highway Safety (IIHS) and National Highway Traffic Safety Administration (NHTSA)
- Uses gas or is a hybrid
- Built between 2015-2020
- Is available in North America

# Bonus

- SUV or hatchback
- Aftermarket support

# Cannot have

- Moon roof
```

## Prompting

### Agent Setup

Next we'll start priming our prompt in the Llamanomicon. This will help us quickly draft a prompt which can be expanded to match our use cases.

1. Open Llamanomicon
2. Create agents or use the existing `Prompt Improver` and `Research Assistant` agents
3. Toggle on or off text snippets relevant to this task
4. When your agents are done, save your changes, copy and paste the prompt over to your text editor
5. Note: Now is a good time to export your data if you'd like to keep a permanent copy of these agents

### Building the prompt

With the filter criteria and Llamanomicon prompt done, the final step is adding additional context. This could be adding a role, explaining the expected output format, or adding important bits of information.

### Context Example

```md
You are a master auto mechanic. You've building a report of used vehicles to recommend purchasing which adhere to a list of requirements. Making recommendations which meet all requirements is a top priority. If there is a vehicle which comes close, mention it, but do not include it in the recommendations.

You will present your recommendation as tables. One for ICE vehicles and one for hybrids. Each table will have a column for make, model, year range, and generation. For each generation, provide a quick comparison of this line vs the other recommendations.
```

### Optional: Refinement

Reviewing your prompt with an LLM can help highlight blindspots, let you discuss major trade-offs, or explain certain parts in more detail to make an objective clearer.

To do this, copy the `Prompt Improver` and your prompt file into your LLM of choice (in a new chat).

This will generate multiple variations of your prompt and provide suggestions. Keep refining, then copy the result back into your text editor.

You can always tell it to `Take the approved changes and recommendations from this chat and generate a llm-optimized prompt`.

## Researching

In a new conversation, copy over your prompt file or text, and begin the research!

## Analyze the Results

When it is done researching, read through the results. Did it do a good job?

Ask yourself:

- Did it miss anything I should add to the context?
- Did it misunderstand an aspect of the prompt?
- Based on the results, should I change the search criteria?
- Did my requirements change based on new information provided by the research?
- How can I verify the research is accurate?

## Extra Credit

- Try using different models
- Compare the results between providers
- How different was the response when you submitted the same prompt in a new conversation?
