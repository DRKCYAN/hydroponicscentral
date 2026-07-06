/**
 * Left-rail navigation, organized by WORKFLOW VERB — not by math category
 * (spec §3). Each group answers one question the user has. "Decide" has a single
 * item, so it renders as a direct link, not a dropdown.
 */
export interface NavItem {
  label: string;
  href: string;
}
export interface NavGroup {
  verb: string;
  question: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    verb: "Configure",
    question: "Am I defining something?",
    items: [
      { label: "Systems", href: "/app/systems" },
      { label: "Water Source Profiles", href: "/app/water-sources" },
      { label: "Fertilizer Library", href: "/app/fertilizers" },
      { label: "Account", href: "/app/account" },
    ],
  },
  {
    verb: "Record",
    question: "Am I writing a fact that just happened?",
    items: [
      { label: "Log Entry", href: "/app/log" },
      { label: "Harvest Log", href: "/app/harvest" },
    ],
  },
  {
    verb: "Decide",
    question: "Do I want the app to compute a choice?",
    items: [
      { label: "Recipe Solver", href: "/app/solver" },
      { label: "Planning & Economics", href: "/app/planning" },
    ],
  },
  {
    verb: "Monitor",
    question: "Am I checking status?",
    items: [
      { label: "Dashboard", href: "/app/dashboard" },
      { label: "System History & Trends", href: "/app/history" },
    ],
  },
];
