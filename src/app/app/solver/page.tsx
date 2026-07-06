import type { Metadata } from "next";
import { Workspace, PageHeader } from "@/components/ui/page";
import { RecipeSolver } from "@/components/solver/RecipeSolver";
import { StatusPill } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Recipe Solver" };

export default function SolverPage() {
  return (
    <Workspace>
      <PageHeader
        verb="Decide"
        title="Recipe Solver"
        description="State the target profile; the engine computes the mix. Solving is reversible experimentation — activating a recipe is a separate, explicit commit."
        actions={<StatusPill status="ok">Pro · unlocked</StatusPill>}
      />
      <RecipeSolver tier="pro" />
    </Workspace>
  );
}
