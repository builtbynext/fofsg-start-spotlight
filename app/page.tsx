import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { mockProjects } from "@/lib/mock-data";
import GalleryPage from "@/components/GalleryPage";

export const revalidate = 60;

async function fetchApprovedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn("Falling back to mock data:", error?.message ?? "no data");
    return mockProjects;
  }
  return data as Project[];
}

export default async function Home() {
  const projects = await fetchApprovedProjects();
  return (
    <Suspense>
      <GalleryPage projects={projects} />
    </Suspense>
  );
}
