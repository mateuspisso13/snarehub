import { Calendar, CheckCircle2, AlertCircle, Layers, Image as ImageIcon, PlayCircle, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillarBadge } from "./PillarBadge";
import { cn } from "@/lib/utils";

export type PostRow = {
  id: string;
  position: number;
  date_label: string | null;
  day_label: string | null;
  theme: string | null;
  format: string | null;
  channels: string[];
  strategic_pillar: string | null;
  intention_pillar: string | null;
  disclaimer: string | null;
  visual_suggestion: string | null;
  art_headline: string | null;
  art_subtitle: string | null;
  carousel_content: { title?: string; body?: string }[] | unknown;
  video_script: string | null;
  ig_fb_caption: string | null;
  linkedin_caption: string | null;
  hashtags: string | null;
  approval_status: string;
  client_feedback: string | null;
};

function FormatIcon({ format }: { format?: string | null }) {
  if (!format) return <Layers className="h-3.5 w-3.5" />;
  if (/v[ií]deo|reels/i.test(format)) return <PlayCircle className="h-3.5 w-3.5" />;
  if (/carrossel/i.test(format)) return <Layers className="h-3.5 w-3.5" />;
  return <ImageIcon className="h-3.5 w-3.5" />;
}

interface Props {
  post: PostRow;
  view: "agency" | "client";
  onEdit?: () => void;
  onApprove?: () => void;
  onRequestChange?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

export function PostCard({ post, view, onEdit, onApprove, onRequestChange, onDelete, readOnly }: Props) {
  const status = post.approval_status;
  const isCarousel = /carrossel/i.test(post.format || "");
  const carousel = Array.isArray(post.carousel_content) ? (post.carousel_content as { title?: string; body?: string }[]) : [];

  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-white/[0.06] bg-card shadow-card",
        "transition-all hover:border-white/[0.12] hover:-translate-y-0.5",
      )}
    >
      {/* status stripe */}
      <div
        className={cn(
          "absolute left-0 top-6 h-12 w-0.5 rounded-r-full",
          status === "approved" && "bg-success",
          status === "changes_requested" && "bg-warning",
          status === "pending" && "bg-white/10",
        )}
      />

      <header className="flex items-start justify-between gap-4 px-6 pt-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-mono">{post.date_label ?? "—"}</span>
            {post.day_label && <span>· {post.day_label}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1.5 border-white/10 bg-white/[0.02] font-normal">
              <FormatIcon format={post.format} />
              {post.format ?? "Formato"}
            </Badge>
            {post.channels?.map((c) => (
              <Badge key={c} variant="outline" className="border-white/10 bg-white/[0.02] font-normal">
                {c}
              </Badge>
            ))}
            <PillarBadge label={post.strategic_pillar} />
            <PillarBadge label={post.intention_pillar} kind="intention" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit} className="opacity-60 group-hover:opacity-100">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100"
              title="Excluir post"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </header>

      <div className="px-6 py-4">
        <h3 className="text-base font-semibold leading-snug tracking-tight">
          {post.theme || post.art_headline || "Sem tema"}
        </h3>
      </div>

      {view === "agency" && post.disclaimer && (
        <div className="mx-6 mb-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Disclaimer estratégico</p>
          <p className="text-sm text-foreground/80">{post.disclaimer}</p>
        </div>
      )}

      {view === "agency" && post.visual_suggestion && (
        <div className="mx-6 mb-4 rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sugestão visual</p>
          <p className="text-sm text-foreground/70">{post.visual_suggestion}</p>
        </div>
      )}

      {(post.art_headline || post.art_subtitle) && !isCarousel && (
        <div className="mx-6 mb-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Arte</p>
          <p className="text-base font-medium leading-snug">{post.art_headline}</p>
          {post.art_subtitle && <p className="mt-1 text-sm text-muted-foreground">{post.art_subtitle}</p>}
        </div>
      )}

      {isCarousel && carousel.length > 0 && (
        <div className="mx-6 mb-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Carrossel · {carousel.length} slides</p>
          <div className="grid gap-2">
            {carousel.map((slide, i) => (
              <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-xs text-muted-foreground">Slide {i + 1}</p>
                <p className="text-sm font-medium">{slide.title}</p>
                {slide.body && <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{slide.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {post.video_script && (
        <div className="mx-6 mb-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Roteiro do vídeo</p>
          <p className="whitespace-pre-wrap text-sm text-foreground/80">{post.video_script}</p>
        </div>
      )}

      {(post.ig_fb_caption || post.linkedin_caption) && (
        <div className="mx-6 mb-4 grid gap-3 md:grid-cols-2">
          {post.ig_fb_caption && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Legenda IG / FB</p>
              <p className="whitespace-pre-wrap text-sm text-foreground/80">{post.ig_fb_caption}</p>
            </div>
          )}
          {post.linkedin_caption && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Legenda LinkedIn</p>
              <p className="whitespace-pre-wrap text-sm text-foreground/80">{post.linkedin_caption}</p>
            </div>
          )}
        </div>
      )}

      {post.hashtags && (
        <div className="mx-6 mb-4">
          <p className="text-xs text-muted-foreground/70">{post.hashtags}</p>
        </div>
      )}

      <footer className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-6 py-3">
        <div className="text-xs text-muted-foreground">
          {status === "approved" && (
            <span className="inline-flex items-center gap-1.5 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Aprovado</span>
          )}
          {status === "changes_requested" && (
            <span className="inline-flex items-center gap-1.5 text-warning"><AlertCircle className="h-3.5 w-3.5" /> Ajustes solicitados</span>
          )}
          {status === "pending" && <span>Aguardando aprovação</span>}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={status === "changes_requested" ? "default" : "outline"}
              onClick={onRequestChange}
              className="h-8"
            >
              Ajustar
            </Button>
            <Button
              size="sm"
              onClick={onApprove}
              className={cn(
                "h-8",
                status === "approved"
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-gradient-primary text-primary-foreground hover:opacity-90",
              )}
            >
              {status === "approved" ? "Aprovado" : "Aprovar"}
            </Button>
          </div>
        )}
      </footer>
    </article>
  );
}
