import { NavSidebar } from "./NavSidebar";
import { SessionControls } from "./SessionControls";

export function AppHeader() {
  return (
    <header
      role="banner"
      style={{
        gridRow: "1",
        gridColumn: "1 / -1",
        transition: "box-shadow 200ms ease, background-color 200ms ease",
      }}
      className="bg-surface shadow-md/30 w-full flex items-center justify-between px-5 py-3"
    >
      <span className="font-bold bg-linear-to-r from-blue-600  to-orange-600 dark:from-blue-500  dark:to-orange-500 bg-clip-text text-transparent">
        LLAMANOMICON
      </span>

      <div
        className="flex items-center gap-1 space-x-3"
        data-tour-target="session-controls"
      >
        <SessionControls />

        <NavSidebar />
      </div>
    </header>
  );
}
