"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./primitives";

/** Submit button that shows a pending spinner while its enclosing form action
 * is in flight. Must be rendered as a descendant of the <form>. */
export function SubmitButton({
  children,
  pendingText,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      loading={pending}
      loadingText={pendingText}
      className={className}
    >
      {children}
    </Button>
  );
}
