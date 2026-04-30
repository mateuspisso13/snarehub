import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { CHANNELS, FORMATS, INTENTION_PILLARS, STRATEGIC_PILLARS } from "@/lib/constants";
import type { PostRow } from "./PostCard";

interface Props {
  post: PostRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (patch: Partial<PostRow>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function PostEditor({ post, open, onOpenChange, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<PostRow | null>(post);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(post), [post]);

  if (!draft) return null;

  const update = <K extends keyof PostRow>(k: K, v: PostRow[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const carousel = Array.isArray(draft.carousel_content) ? (draft.carousel_content as { title?: string; body?: string }[]) : [];

  const updateSlide = (i: number, patch: { title?: string; body?: string }) => {
    const next = [...carousel];
    next[i] = { ...next[i], ...patch };
    update("carousel_content", next);
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await onSave(draft);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Editar post</SheetTitle>
          <SheetDescription>Todos os campos são editáveis e salvos no plano.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data (rótulo)</Label>
              <Input value={draft.date_label ?? ""} onChange={(e) => update("date_label", e.target.value)} placeholder="01/Maio" />
            </div>
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Input value={draft.day_label ?? ""} onChange={(e) => update("day_label", e.target.value)} placeholder="Quarta-feira" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tema / título do post</Label>
            <Textarea rows={2} value={draft.theme ?? ""} onChange={(e) => update("theme", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Formato</Label>
              <Select value={draft.format ?? ""} onValueChange={(v) => update("format", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={draft.approval_status} onValueChange={(v) => update("approval_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="changes_requested">Ajustes solicitados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Canais</Label>
            <div className="flex flex-wrap gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              {CHANNELS.map((c) => {
                const checked = draft.channels.includes(c);
                return (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const set = new Set(draft.channels);
                        if (v) set.add(c); else set.delete(c);
                        update("channels", Array.from(set));
                      }}
                    />
                    {c}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Pilar estratégico</Label>
              <Select value={draft.strategic_pillar ?? ""} onValueChange={(v) => update("strategic_pillar", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {STRATEGIC_PILLARS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pilar de intenção</Label>
              <Select value={draft.intention_pillar ?? ""} onValueChange={(v) => update("intention_pillar", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {INTENTION_PILLARS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Disclaimer estratégico</Label>
            <Textarea rows={3} value={draft.disclaimer ?? ""} onChange={(e) => update("disclaimer", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Sugestão visual</Label>
            <Textarea rows={2} value={draft.visual_suggestion ?? ""} onChange={(e) => update("visual_suggestion", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Headline da arte</Label>
              <Textarea rows={2} value={draft.art_headline ?? ""} onChange={(e) => update("art_headline", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Subtítulo da arte</Label>
              <Textarea rows={2} value={draft.art_subtitle ?? ""} onChange={(e) => update("art_subtitle", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Slides do carrossel</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update("carousel_content", [...carousel, { title: "", body: "" }])}
              >
                <Plus className="mr-1 h-3 w-3" /> Slide
              </Button>
            </div>
            <div className="space-y-2">
              {carousel.map((s, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Slide {i + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => update("carousel_content", carousel.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input value={s.title ?? ""} onChange={(e) => updateSlide(i, { title: e.target.value })} placeholder="Título" />
                  <Textarea rows={2} value={s.body ?? ""} onChange={(e) => updateSlide(i, { body: e.target.value })} placeholder="Texto do slide" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Roteiro do vídeo</Label>
            <Textarea rows={4} value={draft.video_script ?? ""} onChange={(e) => update("video_script", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Legenda Instagram / Facebook</Label>
            <Textarea rows={5} value={draft.ig_fb_caption ?? ""} onChange={(e) => update("ig_fb_caption", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Legenda LinkedIn</Label>
            <Textarea rows={5} value={draft.linkedin_caption ?? ""} onChange={(e) => update("linkedin_caption", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Hashtags</Label>
            <Textarea rows={2} value={draft.hashtags ?? ""} onChange={(e) => update("hashtags", e.target.value)} />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-4">
            {onDelete ? (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete}>
                <Trash2 className="mr-1 h-4 w-4" /> Excluir
              </Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
                {saving ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
