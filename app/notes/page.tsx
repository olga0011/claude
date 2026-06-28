import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    redirect("/auth/login");
  }

  const { data: notes, error } = await supabase.from("notes").select("id, title, body").order("created_at");

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <strong>{note.title}</strong>
            {note.body && <p>{note.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
