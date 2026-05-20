import type { Agent, Snippet, Skill } from "@/types";
import { UNTAGGED_SKILL_ID } from "@/lib/storeUtils";

const SNIPPET_SEPARATOR = "\n";

function toXmlTagName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return /^[0-9]/.test(slug) ? `_${slug}` : slug || "group";
}

function getActiveSnippetsForSkill(
  skillId: string,
  activeSet: Set<string>,
  snippets: Map<string, Snippet>,
  snippetsBySkill: Map<string, Set<string>>,
): Snippet[] {
  const ids = snippetsBySkill.get(skillId);
  if (!ids) return [];
  const result: Snippet[] = [];
  for (const id of ids) {
    if (activeSet.has(id)) {
      const snippet = snippets.get(id);
      if (snippet) result.push(snippet);
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

interface SkillGroup {
  skillId: string;
  snippets: Snippet[];
}

export function buildSkillGroups(
  agent: Agent,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
): SkillGroup[] {
  const { activeSet } = agent;

  const orderedGroups: SkillGroup[] = [];

  // Step 1: all skills with active snippets, alphabetical by skill name
  const skillList: { id: string; name: string }[] = [];
  for (const [skillId, skill] of skills) {
    const active = getActiveSnippetsForSkill(
      skillId,
      activeSet,
      snippets,
      snippetsBySkill,
    );
    if (active.length > 0) {
      skillList.push({ id: skillId, name: skill.name });
    }
  }
  skillList.sort((a, b) => a.name.localeCompare(b.name));
  for (const { id: skillId } of skillList) {
    orderedGroups.push({
      skillId,
      snippets: getActiveSnippetsForSkill(
        skillId,
        activeSet,
        snippets,
        snippetsBySkill,
      ),
    });
  }

  // Step 2: untagged group — active snippets with no skill tags (always last)
  const untaggedSnippets: Snippet[] = [];
  for (const id of activeSet) {
    const snippet = snippets.get(id);
    if (snippet?.skills.size === 0) {
      untaggedSnippets.push(snippet);
    }
  }
  if (untaggedSnippets.length > 0) {
    orderedGroups.push({
      skillId: UNTAGGED_SKILL_ID,
      snippets: untaggedSnippets.sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  return orderedGroups;
}

export function compileOutputBySkillGroup(
  agent: Agent | null,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
): string {
  if (!agent || agent.activeSet.size === 0) return "";

  const orderedGroups = buildSkillGroups(
    agent,
    snippets,
    skills,
    snippetsBySkill,
  );

  // Emit snippets in group order; multi-skill snippets deduplicated by seen set
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const group of orderedGroups) {
    for (const snippet of group.snippets) {
      if (seen.has(snippet.id)) continue;
      seen.add(snippet.id);
      const text = snippet.text.trim();
      if (text) parts.push(text);
    }
  }

  return parts.join(SNIPPET_SEPARATOR).trim();
}

export function compileOutputXML(
  agent: Agent | null,
  snippets: Map<string, Snippet>,
  skills: Map<string, Skill>,
  snippetsBySkill: Map<string, Set<string>>,
): string {
  if (!agent || agent.activeSet.size === 0) return "";

  const orderedGroups = buildSkillGroups(
    agent,
    snippets,
    skills,
    snippetsBySkill,
  );

  const seen = new Set<string>();
  const sections: string[] = [];

  for (const group of orderedGroups) {
    const rawName =
      group.skillId === UNTAGGED_SKILL_ID
        ? "Untagged"
        : (skills.get(group.skillId)?.name ?? group.skillId);
    const tagName = toXmlTagName(rawName);

    const snippetTexts: string[] = [];
    for (const snippet of group.snippets) {
      if (seen.has(snippet.id)) continue;
      seen.add(snippet.id);
      const text = snippet.text.trim();
      if (text) snippetTexts.push(`• ${text}`);
    }

    if (snippetTexts.length > 0) {
      sections.push(`<${tagName}>\n${snippetTexts.join("\n")}\n</${tagName}>`);
    }
  }

  return sections.join("\n\n");
}
