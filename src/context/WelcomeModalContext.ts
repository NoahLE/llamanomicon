import { createContext, use } from "react";

export const WelcomeModalContext = createContext<() => void>(() => {
  throw new Error(
    "useWelcomeModal must be used within a WelcomeModalContext provider",
  );
});

export function useWelcomeModal() {
  return use(WelcomeModalContext);
}
