import { Link } from "@heroui/react";
import { ExternalLinkIcon } from "lucide-react";

export function DocsTutorial() {
  const tutorials = [
    {
      name: "Used car researcher",
      link: "https://github.com/NoahLE/llamanomicon/blob/main/tutorials/used-car.md",
    },
    {
      name: "Recipe maker",
      link: "https://github.com/NoahLE/llamanomicon/blob/main/tutorials/recipe-maker.md",
    },
    {
      name: "Data extractor",
      link: "https://github.com/NoahLE/llamanomicon/blob/main/tutorials/food-parser.md",
    },
  ];

  return (
    <ul>
      {tutorials.map((tutorial) => (
        <li key={tutorial.name} className="flex flex-row items-center">
          <ExternalLinkIcon className="mr-1" size={15} />
          <Link href={tutorial.link} target="_blank" className="text-lg">
            {tutorial.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
