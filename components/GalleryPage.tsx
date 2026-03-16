"use client";

import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Project } from "@/lib/types";
import ProjectPanel from "@/components/ProjectPanel";

const StampCanvas = dynamic(() => import("@/components/StampCanvas"), {
  ssr: false,
});

type Props = {
  projects: Project[];
};

export default function GalleryPage({ projects }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("project");

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <StampCanvas
        projects={projects}
        onSelectProject={(id) => router.push(`/?project=${id}`, { scroll: false })}
        dimmed={!!selectedId}
      />
      <ProjectPanel
        project={selectedProject}
        onClose={() => router.push("/", { scroll: false })}
      />
    </div>
  );
}
