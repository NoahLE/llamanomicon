export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "taggroup";
  defaultValue?: string;
  placeholder?: string;
  options?: { id: string; label: string }[];
}

export const agentFormFields: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    defaultValue: "",
    placeholder: "Agent name",
  },
];

export const skillFormFields: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    defaultValue: "",
    placeholder: "Skill name",
  },
];

export const snippetFormFields: FormField[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    defaultValue: "",
    placeholder: "Snippet name",
  },
  {
    key: "text",
    label: "text",
    type: "textarea",
    defaultValue: "",
    placeholder: "The prompt text",
  },
];
