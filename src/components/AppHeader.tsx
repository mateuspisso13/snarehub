import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary shadow-elegant">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Snare<span className="text-muted-foreground"> · social hub</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
