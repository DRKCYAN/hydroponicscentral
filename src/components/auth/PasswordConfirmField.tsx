"use client";

import { useRef } from "react";
import { inputClass } from "@/components/ui/field";

/** Password + confirm-password pair. Blocks submission on mismatch via the
 * native Constraint Validation API — no client JS submit handler needed, so
 * the enclosing form's server-action progressive enhancement is untouched. */
export function PasswordConfirmField() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function checkMatch() {
    if (!passwordRef.current || !confirmRef.current) return;
    confirmRef.current.setCustomValidity(
      confirmRef.current.value !== passwordRef.current.value ? "Passwords do not match." : ""
    );
  }

  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Password</span>
        <input
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="min. 8 characters"
          onChange={checkMatch}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">Confirm password</span>
        <input
          ref={confirmRef}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="re-enter password"
          onChange={checkMatch}
        />
      </label>
    </>
  );
}
