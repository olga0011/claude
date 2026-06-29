import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome to your workspace</h1>
      <p className="text-muted-foreground">You are signed in as {data.claims.email}.</p>
    </div>
  );
}
