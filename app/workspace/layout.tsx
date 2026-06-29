import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center px-6">
        <div className="flex-1 font-semibold">Workspace</div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{data.claims.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}