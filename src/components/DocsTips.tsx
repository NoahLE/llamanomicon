export function DocsTips() {
  const general = [
    "Write as if you're speaking to another person.",
    "Be clear and direct with explicit instructions.",
    "Be clear about constraints.",
    "Positive examples are more effective than negative ones.",
  ];

  const setup = [
    "Work in plan mode or dedicate a conversation to building the initial prompts.",
    "Clearly describe what you are expecting for the end result.",
    "Be specific and iterate on your prompt.",
    "Provide as much relevant context as possible.",
    "Add supporting documents or provide examples.",
    "Examples should be relevant, diverse, and structured. 3-5 cases is ideal.",
    "Give the agent a role.",
    "If you want the agent to copy the tone of a medium, you can copy blog posts, web links, or other contents into the chat for reference.",
  ];

  const conversation = [
    "Keep an eye on your token useage.",
    "Clear context or start a new conversation at major checkpoints.",
    "Use numbered lists or bullet points when the order or completeness of steps matter.",
    "For document tasks, ask it to quote relevant parts before carrying out the task.",
  ];

  const promptStructure = [
    "Task - Start with an action verb (generative, find, identify, write, analyze, etc). Be clear about the end goal.",
    "Context - What does success look like? What other information will be helpful for completing this task?",
    "Examples - What are some example structures which could be used as reference? Examples: STAR method, SMART goals, to-do checklist",
    "Persona - Who should the agent mimic? Examples: senior software engineer, master car mechanic, data analyst",
    "Format - Should the response have a specific format such as a table, bullet points, a Markdown file",
    "Tone - The attitude or mood of the response. Examples: casual, formal, enthusiastic",
  ];

  function makeList(points: string[]) {
    return (
      <ul className="list-disc pl-5">
        {points.map((point) => (
          <li key={point.slice(0, 15)}>{point}</li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <h2 className="font-bold underline">General Tips</h2>
      {makeList(general)}
      <br />

      <h2 className="font-bold underline">General Prompt Structure</h2>
      {makeList(promptStructure)}
      <br />

      <h2 className="font-bold underline">Conversation Setup Tips</h2>
      {makeList(setup)}
      <br />

      <h2 className="font-bold underline">Mid-conversation tips</h2>
      {makeList(conversation)}
    </>
  );
}
