// src/data/checklistData.ts
export interface ChecklistItem {
    id: string;
    title: string;
    description: string;
  }
  
  export interface Section {
    key: SectionKey;
    title: string;
    icon: React.ReactElement;
    items: ChecklistItem[];
  }
  
  /** Map keys that match Zustand section state */
  export type SectionKey =
    | "react"
    | "typescript"
    | "tailwind"
    | "zustand"
    | "fastapi"
    | "pydantic"
    | "docker"
    | "general";
  
  import {
    Code,
    FileJson,
    Settings,
    Zap,
    Shield,
    Package,
    Database,
  } from "lucide-react";
  
  /* …(same arrays you already had, trimmed for brevity)… */
  import {
    generalItems,
    reactItems,
    typescriptItems,
    tailwindItems,
    zustandItems,
    fastapiItems,
    pydanticItems,
    dockerItems,
  } from "./items"; // <- break up further if you like
  
  export const SECTIONS: Section[] = [
    { key: "general", title: "General Code Quality", icon: <Code />, items: generalItems },
    { key: "react", title: "React Components", icon: <Code />, items: reactItems },
    { key: "typescript", title: "TypeScript", icon: <FileJson />, items: typescriptItems },
    { key: "tailwind", title: "Tailwind CSS", icon: <Code />, items: tailwindItems },
    { key: "zustand", title: "Zustand State", icon: <Settings />, items: zustandItems },
    { key: "fastapi", title: "FastAPI", icon: <Zap />, items: fastapiItems },
    { key: "pydantic", title: "Pydantic", icon: <Shield />, items: pydanticItems },
    { key: "docker", title: "Docker & Compose", icon: <Package />, items: dockerItems },
  ];
  