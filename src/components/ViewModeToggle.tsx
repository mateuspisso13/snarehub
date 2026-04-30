import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, Table as TableIcon, Columns3 } from "lucide-react";
import type { ViewMode } from "./PostsView";

const KEY = "snare:viewMode";

export function loadViewMode(): ViewMode {
  if (typeof window === "undefined") return "table";
  const v = window.localStorage.getItem(KEY);
  if (v === "feed" || v === "table" || v === "kanban") return v;
  return "table";
}
export function saveViewMode(v: ViewMode) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, v);
}

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => {
        if (!v) return;
        const next = v as ViewMode;
        onChange(next);
        saveViewMode(next);
      }}
      className="rounded-md border border-white/10 bg-white/[0.02] p-0.5"
    >
      <ToggleGroupItem value="table" className="h-7 px-2 text-xs" title="Tabela">
        <TableIcon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem value="kanban" className="h-7 px-2 text-xs" title="Kanban">
        <Columns3 className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem value="feed" className="h-7 px-2 text-xs" title="Feed">
        <LayoutList className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
