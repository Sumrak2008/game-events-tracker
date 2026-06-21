import { redirect } from "next/navigation";

// The public archive has been removed: this site only shows active and
// upcoming records. Completed records still live in the JSON data files and
// Git history — they are just never rendered. Any old /archive link or
// bookmark is redirected to the home page instead of 404ing.
export default function ArchivePage() {
  redirect("/");
}
