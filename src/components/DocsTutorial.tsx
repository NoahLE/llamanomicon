export function DocsTutorial() {
  const tutorials = [
    {
      name: "Used car researcher",
    },
    {
      name: "Recipe planner",
    },
    {
      name: "Data extractor",
    },
  ];

  return (
    <ol>
      {tutorials.map((tut) => (
        <li key={tut.name}>{tut.name}</li>
      ))}
    </ol>
  );
}
