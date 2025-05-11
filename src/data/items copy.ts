import { ChecklistItem } from "./checklistData";

export const generalItems: ChecklistItem[] = [
  { id: "general-1", title: "Code Formatting", description: "Ensure consistent code formatting using Prettier or ESLint." },
  { id: "general-2", title: "Comments", description: "Add meaningful comments to improve code readability." },
];

export const reactItems: ChecklistItem[] = [
  { id: "react-1", title: "Component Structure", description: "Organize components into reusable and maintainable structures." },
  { id: "react-2", title: "Hooks", description: "Use React hooks effectively for state and lifecycle management." },
];

export const typescriptItems: ChecklistItem[] = [
  { id: "typescript-1", title: "Type Safety", description: "Ensure all variables and functions have proper type annotations." },
  { id: "typescript-2", title: "Interfaces", description: "Use interfaces to define object shapes and enforce consistency." },
];

export const tailwindItems: ChecklistItem[] = [
  { id: "tailwind-1", title: "Utility Classes", description: "Use Tailwind utility classes for consistent styling." },
  { id: "tailwind-2", title: "Responsive Design", description: "Ensure responsive design using Tailwind's breakpoints." },
];

export const zustandItems: ChecklistItem[] = [
  { id: "zustand-1", title: "State Management", description: "Use Zustand for managing global state effectively." },
  { id: "zustand-2", title: "Selectors", description: "Use selectors to optimize state access and avoid unnecessary re-renders." },
];

export const fastapiItems: ChecklistItem[] = [
  { id: "fastapi-1", title: "API Endpoints", description: "Define clear and concise API endpoints." },
  { id: "fastapi-2", title: "Validation", description: "Use Pydantic models for request validation." },
];

export const pydanticItems: ChecklistItem[] = [
  { id: "pydantic-1", title: "Model Definitions", description: "Define Pydantic models for data validation and serialization." },
  { id: "pydantic-2", title: "Custom Validators", description: "Implement custom validators for complex data validation." },
];

export const dockerItems: ChecklistItem[] = [
  { id: "docker-1", title: "Dockerfile", description: "Ensure the Dockerfile is optimized for production." },
  { id: "docker-2", title: "Compose", description: "Use Docker Compose for managing multi-container applications." },
];