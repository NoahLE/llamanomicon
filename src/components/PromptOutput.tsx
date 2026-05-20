import { useState } from "react";
import { Button, ButtonGroup } from "@heroui/react";
import { Check, ClipboardCopy } from "lucide-react";

import { useAppStore } from "@/store/useAppStore";
import {
  selectCompiledOutput,
  selectCompiledOutputXML,
} from "@/store/useSettings";
import { useCopyToClipboard } from "@/hooks/useClipboard";

import { AppSection } from "@/components/AppSection";

export function PromptOutput() {
  const [outputFormat, setOutputFormat] = useState<"xml" | "text">("xml");
  const { copy, copied } = useCopyToClipboard();
  const xmlOutput = useAppStore(selectCompiledOutputXML);
  const textOutput = useAppStore(selectCompiledOutput);
  const activeOutput = outputFormat === "xml" ? xmlOutput : textOutput;

  const controls = (
    <div className="flex items-center gap-2">
      <ButtonGroup size="sm">
        <Button
          variant={outputFormat === "xml" ? "primary" : "secondary"}
          className={outputFormat === "xml" ? "shadow-md/30" : ""}
          onPress={() => setOutputFormat("xml")}
        >
          XML
        </Button>

        <Button
          variant={outputFormat === "text" ? "primary" : "secondary"}
          className={outputFormat === "text" ? "shadow-md/30" : ""}
          onPress={() => setOutputFormat("text")}
        >
          Text
        </Button>
      </ButtonGroup>

      <Button
        size="sm"
        className="shadow-md/30"
        isDisabled={!activeOutput}
        onPress={() => copy(activeOutput)}
      >
        {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
      </Button>
    </div>
  );

  return (
    <AppSection
      title="Prompt"
      variant={xmlOutput ? "output" : undefined}
      tourTarget="raw-output"
      controls={controls}
    >
      <pre className="text-sm overflow-auto p-2 bg-blue-500/20 whitespace-pre-wrap wrap-break-words h-full">
        {activeOutput || (
          <span className="text-muted italic">No prompt yet</span>
        )}
      </pre>
    </AppSection>
  );
}
