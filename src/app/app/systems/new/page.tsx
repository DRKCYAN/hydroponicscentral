import { createClient } from "@/lib/supabase/server";
import { DEMO_WATER_SOURCES } from "@/lib/data/demo";
import { NewSystemClient } from "./NewSystemClient";

export const metadata = { title: "New System" };

export default async function NewSystemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let waterSources: { id: string; name: string }[];
  if (user) {
    const { data } = await supabase
      .from("water_sources")
      .select("id, name")
      .order("created_at");
    waterSources = data ?? [];
  } else {
    waterSources = DEMO_WATER_SOURCES.map(({ id, name }) => ({ id, name }));
  }

  return <NewSystemClient waterSources={waterSources} isAuthed={!!user} />;
}
