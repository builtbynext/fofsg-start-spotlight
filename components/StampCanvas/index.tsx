"use client";

import { useEffect, useRef } from "react";
import { Project } from "@/lib/types";
import { setupThreeScene } from "./useThreeScene";
import { setupStampMeshes } from "./useStampMeshes";
import { setupInteraction } from "./useInteraction";

type Props = {
  projects: Project[];
  onSelectProject: (id: string) => void;
  dimmed: boolean;
};

export default function StampCanvas({ projects, onSelectProject, dimmed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep a stable ref to onSelectProject so the effect doesn't re-run on parent re-renders
  const onSelectRef = useRef(onSelectProject);
  useEffect(() => {
    onSelectRef.current = onSelectProject;
  }, [onSelectProject]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanupInteraction: (() => void) | null = null;
    let disposeStamps: (() => void) | null = null;
    let cleanupScene: (() => void) | null = null;

    const { ctx, cleanup: cleanupSceneFn } = setupThreeScene(container);
    cleanupScene = cleanupSceneFn;

    // Async: load images and build meshes, then wire interaction
    setupStampMeshes(ctx, projects).then((stampCtx) => {
      disposeStamps = stampCtx.dispose;

      // Hook the per-frame hover lerp into the render loop
      ctx.onFrame = stampCtx.onFrame;

      // Attach interaction (wraps onSelectRef so it always calls latest)
      cleanupInteraction = setupInteraction(ctx, stampCtx, (id) =>
        onSelectRef.current(id)
      );
    });

    return () => {
      cleanupInteraction?.();
      disposeStamps?.();
      cleanupScene?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        transition: "filter 0.4s ease, opacity 0.4s ease",
        filter: dimmed ? "blur(3px)" : "none",
        opacity: dimmed ? 0.35 : 1,
        pointerEvents: dimmed ? "none" : "auto",
      }}
    >
      {/* Three.js canvas — title label is rendered as a mesh inside the scene */}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
