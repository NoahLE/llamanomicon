import { Input, Label, Tag, TagGroup, TextArea } from "@heroui/react";

import type { FormField } from "@/lib/formFields";

interface AppFormFieldGeneratorProps {
  field: FormField;
  value: string;
  placeholder?: string;
  onChange: (key: string, value: string) => void;
}

export function AppFormFieldGenerator({
  field,
  value,
  placeholder,
  onChange,
}: AppFormFieldGeneratorProps) {
  const defaultClasses = "flex w-full my-2";
  const labelId = `label-for-${field.key}`;
  const labelText = field.key.charAt(0).toUpperCase() + field.key.slice(1);

  switch (field.type) {
    case "text":
      return (
        <>
          <Label htmlFor={labelId}>{labelText}</Label>
          <Input
            id={labelId}
            className={`${defaultClasses} shadow-md/20`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </>
      );
    case "textarea":
      return (
        <>
          <Label htmlFor={labelId}>{labelText}</Label>
          <TextArea
            id={labelId}
            aria-label={field.label}
            className={`${defaultClasses} shadow-md/20`}
            value={value}
            placeholder={placeholder}
            rows={25}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </>
      );
    case "taggroup": {
      const selectedKeys = new Set(
        value ? value.split(",").filter(Boolean) : [],
      );
      return (
        <>
          <Label htmlFor={labelId}>{labelText}</Label>
          <TagGroup
            id={labelId}
            className={defaultClasses}
            aria-label={field.label}
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={(keys) => {
              const ids =
                keys === "all"
                  ? (field.options ?? []).map((o) => o.id)
                  : Array.from(keys).map(String);
              onChange(field.key, ids.join(","));
            }}
          >
            <TagGroup.List>
              {(field.options ?? []).map((option) => (
                <Tag key={option.id} id={option.id} className="shadow-md/20">
                  {option.label}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        </>
      );
    }
    default:
      return <div>Field missing type...</div>;
  }
}
