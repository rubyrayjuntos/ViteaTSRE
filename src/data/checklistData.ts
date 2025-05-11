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
  
  import React from "react";
 
  import {
    Code,
    FileJson,
    Settings,
    Zap,
    Shield,
    Package,
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
  } from "./items"; // Consider breaking up imports into separate files for better modularity if needed
  
  export const SECTIONS: Section[] = [
    { key: "general", title: "General Code Quality", icon: React.createElement(Code), items: generalItems },
    { key: "react", title: "React Components", icon: React.createElement(Settings), items: reactItems },
    { key: "typescript", title: "TypeScript", icon: React.createElement(FileJson), items: typescriptItems },
    { key: "tailwind", title: "Tailwind CSS", icon: React.createElement(Zap), items: tailwindItems },
    { key: "zustand", title: "Zustand State", icon: React.createElement(Settings), items: zustandItems },
    { key: "fastapi", title: "FastAPI", icon: React.createElement(Zap), items: fastapiItems },
    { key: "pydantic", title: "Pydantic", icon: React.createElement(Shield), items: pydanticItems },
    { key: "docker", title: "Docker & Compose", icon: React.createElement(Package), items: dockerItems }
  ];
  