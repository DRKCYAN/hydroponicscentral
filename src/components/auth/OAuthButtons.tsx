import { GoogleIcon, GithubIcon } from "@/components/ui/icons";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { signInWithOAuth } from "@/lib/supabase/oauth-actions";

export function OAuthButtons({ from }: { from: "/login" | "/signup" }) {
  return (
    <div className="space-y-2">
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="google" />
        <input type="hidden" name="from" value={from} />
        <SubmitButton variant="secondary" pendingText="Redirecting…" className="w-full">
          <GoogleIcon size={16} /> Continue with Google
        </SubmitButton>
      </form>
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="github" />
        <input type="hidden" name="from" value={from} />
        <SubmitButton variant="secondary" pendingText="Redirecting…" className="w-full">
          <GithubIcon size={16} /> Continue with GitHub
        </SubmitButton>
      </form>
    </div>
  );
}
