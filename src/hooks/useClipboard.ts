import { useState, useCallback } from "react";

export function useCopyToClipboard(): {
  copy: (text: string) => void;
  copied: boolean;
} {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!navigator.clipboard) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // no-op on clipboard failure
      });
  }, []);

  return { copy, copied };
}
