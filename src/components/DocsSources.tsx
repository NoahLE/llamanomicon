import { Link } from "@heroui/react";
import { ExternalLinkIcon } from "lucide-react";

interface PageLink {
  name: string;
  link: string;
}

const guides: PageLink[] = [
  {
    name: "Claude - Prompting Best Practices",
    link: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices",
  },
  {
    name: "Google - Prompting Guide 101",
    link: "https://workspace.google.com/resources/ai/writing-effective-prompts/",
  },
  {
    name: "Coursera - AI for Everyone",
    link: "https://www.coursera.org/learn/ai-for-everyone",
  },
];

const podcasts: PageLink[] = [
  {
    name: "Syntax Podcast",
    link: "https://syntax.fm/",
  },
  {
    name: "Real Python",
    link: "https://realpython.com/podcasts/rpp/",
  },
  {
    name: "Talk Python to Me",
    link: "https://talkpython.fm/",
  },
];

const repos: PageLink[] = [
  {
    name: "Spec-Kit",
    link: "https://github.com/github/spec-kit",
  },
  {
    name: "Andrej Karpathy - LLM Wiki",
    link: "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f",
  },
  {
    name: "pi-mono",
    link: "https://github.com/mitsuhiko/pi-mono",
  },
  {
    name: "Fabric",
    link: "https://github.com/danielmiessler/Fabric",
  },
  {
    name: "LobeHub",
    link: "https://github.com/lobehub/lobehub",
  },
];

function convertToLinks(links: PageLink[]) {
  return (
    <ul className="list-disc pl-5">
      {links.map((link) => (
        <li key={link.name} className="flex flex-row items-center">
          <ExternalLinkIcon className="mr-1" size={15} />
          <Link href={link.link} target="_blank" className="text-lg">
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function DocsSources() {
  return (
    <div>
      <h2>Guides & Courses</h2>
      {convertToLinks(guides)}

      <h2 className="mt-5">Podcasts</h2>
      {convertToLinks(podcasts)}

      <h2 className="mt-5">Repos</h2>
      {convertToLinks(repos)}
    </div>
  );
}
