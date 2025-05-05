import React, { useCallback, useMemo, useState } from "react";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { SECTIONS, SectionKey, ChecklistItem } from "@/data/checklistData";

type ExpandedState = Record<SectionKey, boolean>;
type CompletedState = Record<string, boolean>;

export default function CodeReviewChecklist() {
  /** ---------- localStorage hydration ---------- */
  const [completed, setCompleted] = useState<CompletedState>(() => {
    const saved = localStorage.getItem("checklistProgress");
    return saved ? JSON.parse(saved) : {};
  });

  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    SECTIONS.reduce(
      (acc, s) => ({ ...acc, [s.key]: true }),
      {} as ExpandedState,
    ),
  );

  /** ---------- persistence ---------- */
  React.useEffect(() => {
    localStorage.setItem("checklistProgress", JSON.stringify(completed));
  }, [completed]);

  /** ---------- callbacks ---------- */
  const toggleSection = useCallback((key: SectionKey) => {
    setExpanded((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setCompleted((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  /** ---------- helpers ---------- */
  const progressFor = useCallback(
    (items: ChecklistItem[]) =>
      Math.round(
        (items.filter((i) => completed[i.id]).length / items.length) * 100,
      ),
    [completed],
  );

  /** ---------- render ---------- */
  return (
    <div className="max-w-3xl mx-auto p-4 bg-white">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Interactive Code Review Checklist
        </h1>
        <p className="text-gray-600 mt-2">
          Track your progress across the full stack
        </p>
      </header>

      {SECTIONS.map((section) => {
        const progress = progressFor(section.items);
        return (
          <section
            key={section.key}
            className="mb-6 border border-gray-200 rounded-lg shadow-sm"
          >
            {/* header */}
            <button
              className="flex w-full items-center justify-between p-4 bg-gray-50 rounded-t-lg"
              onClick={() => toggleSection(section.key)}
            >
              <div className="flex items-center">
                {React.cloneElement(section.icon, {
                  className: "w-5 h-5 text-gray-700",
                })}
                <span className="ml-2 font-semibold">{section.title}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-3 text-sm text-gray-500">{progress}%</span>
                <span className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <span
                    className="block h-2 bg-blue-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </span>
                {expanded[section.key] ? (
                  <ChevronDown className="ml-3 w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="ml-3 w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* content */}
            {expanded[section.key] && (
              <div className="p-1 border-t border-gray-200">
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    role="checkbox"
                    aria-checked={completed[item.id] ?? false}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleItem(item.id)}
                    onClick={() => toggleItem(item.id)}
                    className="flex items-start py-2 px-3 hover:bg-gray-50 rounded cursor-pointer focus:ring-2 focus:ring-blue-200"
                  >
                    {completed[item.id] ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          completed[item.id]
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-xs ${
                          completed[item.id]
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
