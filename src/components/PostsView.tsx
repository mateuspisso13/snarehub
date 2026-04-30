import { useMemo } from "react";
import { PostCard, type PostRow } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Pencil, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMATS } from "@/lib/constants";

export type ViewMode = "feed" | "table" | "kanban";

interface Props {
  posts: PostRow[];
  view: "agency" | "client";
  mode: ViewMode;
  readOnly?: boolean;
  onEdit?: (post: PostRow) => void;
  onDelete?: (post: PostRow) => void;
  onApprove?: (post: PostRow) => void;
  onRequestChange?: (post: PostRow) => void;
  onUpdate?: (post: PostRow, patch: Partial<PostRow>) => void;
  onSetStatus?: (post: PostRow, status: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Em revisão",
  changes_requested: "Ajustes pedidos",
  approved: "Aprovado",
};
const STATUS_DOT: Record<string, string> = {
  pending: "bg-white/30",
  changes_requested: "bg-warning",
  approved: "bg-success",
};

export function PostsView(props: Props) {
  const { posts, mode } = props;
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
        <p className="text-sm text-muted-foreground">Nada por aqui ainda.</p>
      </div>
    );
  }
  if (mode === "table") return <PostsTable {...props} />;
  if (mode === "kanban") return <PostsKanban {...props} />;
  return <PostsFeed {...props} />;
}

/* ---------- FEED ---------- */
function PostsFeed({
  posts,
  view,
  readOnly,
  onEdit,
  onDelete,
  onApprove,
  onRequestChange,
}: Props) {
  return (
    <div className="grid gap-4">
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          view={view}
          readOnly={readOnly}
          onEdit={view === "agency" && !readOnly ? () => onEdit?.(p) : undefined}
          onDelete={view === "agency" && !readOnly ? () => onDelete?.(p) : undefined}
          onApprove={() => onApprove?.(p)}
          onRequestChange={() => onRequestChange?.(p)}
        />
      ))}
    </div>
  );
}

/* ---------- TABLE (inline-editable for agency) ---------- */
function PostsTable({
  posts,
  view,
  readOnly,
  onEdit,
  onDelete,
  onApprove,
  onRequestChange,
  onUpdate,
  onSetStatus,
}: Props) {
  const editable = view === "agency" && !readOnly;
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="w-[90px]">Data</TableHead>
            <TableHead>Tema</TableHead>
            <TableHead className="w-[120px]">Formato</TableHead>
            <TableHead className="w-[180px]">Canais</TableHead>
            <TableHead className="w-[160px]">Status</TableHead>
            <TableHead className="w-[110px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((p) => (
            <TableRow
              key={p.id}
              className={cn(
                "border-white/[0.04] transition",
                p.approval_status === "approved" && "bg-success/[0.04]",
                p.approval_status === "changes_requested" && "bg-warning/[0.04]",
              )}
            >
              <TableCell className="align-top font-mono text-xs text-muted-foreground">
                {editable ? (
                  <Input
                    value={p.date_label ?? ""}
                    onChange={(e) => onUpdate?.(p, { date_label: e.target.value })}
                    className="h-7 border-white/5 bg-transparent px-2 text-xs"
                    placeholder="01/Mai"
                  />
                ) : (
                  p.date_label ?? "—"
                )}
              </TableCell>
              <TableCell className="align-top">
                {editable ? (
                  <Input
                    value={p.theme ?? ""}
                    onChange={(e) => onUpdate?.(p, { theme: e.target.value })}
                    className="h-7 border-white/5 bg-transparent px-2 text-sm"
                    placeholder="Tema do post"
                  />
                ) : (
                  <span className="text-sm">{p.theme || "—"}</span>
                )}
                {p.day_label && !editable && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{p.day_label}</p>
                )}
              </TableCell>
              <TableCell className="align-top">
                {editable ? (
                  <Select
                    value={p.format ?? ""}
                    onValueChange={(v) => onUpdate?.(p, { format: v })}
                  >
                    <SelectTrigger className="h-7 border-white/5 bg-transparent px-2 text-xs">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="border-white/10 bg-white/[0.02] font-normal">
                    {p.format ?? "—"}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-wrap gap-1">
                  {(p.channels ?? []).map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="border-white/10 bg-white/[0.02] text-[10px] font-normal"
                    >
                      {c}
                    </Badge>
                  ))}
                  {(!p.channels || p.channels.length === 0) && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="align-top">
                {editable ? (
                  <Select
                    value={p.approval_status}
                    onValueChange={(v) => onSetStatus?.(p, v)}
                  >
                    <SelectTrigger className="h-7 border-white/5 bg-transparent px-2 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Em revisão</SelectItem>
                      <SelectItem value="changes_requested">Ajustes pedidos</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[p.approval_status])} />
                    {STATUS_LABEL[p.approval_status] ?? p.approval_status}
                  </span>
                )}
              </TableCell>
              <TableCell className="align-top text-right">
                <div className="flex items-center justify-end gap-1">
                  {view === "client" && !readOnly && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Aprovar"
                        onClick={() => onApprove?.(p)}
                        className={cn(
                          "h-7 w-7 p-0",
                          p.approval_status === "approved" && "text-success",
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Pedir ajustes"
                        onClick={() => onRequestChange?.(p)}
                        className={cn(
                          "h-7 w-7 p-0",
                          p.approval_status === "changes_requested" && "text-warning",
                        )}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  {editable && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title="Editar tudo"
                        onClick={() => onEdit?.(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        title="Excluir"
                        onClick={() => onDelete?.(p)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ---------- KANBAN ---------- */
const KANBAN_COLS: { id: string; label: string }[] = [
  { id: "pending", label: "Em revisão" },
  { id: "changes_requested", label: "Ajustes pedidos" },
  { id: "approved", label: "Aprovados" },
];

function PostsKanban({
  posts,
  view,
  readOnly,
  onEdit,
  onDelete,
  onSetStatus,
  onApprove,
  onRequestChange,
}: Props) {
  const editable = view === "agency" && !readOnly;
  const grouped = useMemo(() => {
    const map: Record<string, PostRow[]> = { pending: [], changes_requested: [], approved: [] };
    posts.forEach((p) => {
      const key = map[p.approval_status] ? p.approval_status : "pending";
      map[key].push(p);
    });
    return map;
  }, [posts]);

  function onDragStart(e: React.DragEvent, postId: string) {
    e.dataTransfer.setData("text/plain", postId);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDropCol(e: React.DragEvent, status: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const post = posts.find((p) => p.id === id);
    if (!post || post.approval_status === status) return;
    onSetStatus?.(post, status);
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {KANBAN_COLS.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => editable && e.preventDefault()}
          onDrop={(e) => editable && onDropCol(e, col.id)}
          className="flex flex-col rounded-xl border border-white/[0.06] bg-card/40 p-3"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[col.id])} />
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {col.label}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {grouped[col.id].length}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {grouped[col.id].length === 0 && (
              <div className="rounded-lg border border-dashed border-white/[0.06] py-6 text-center text-[11px] text-muted-foreground">
                vazio
              </div>
            )}
            {grouped[col.id].map((p) => (
              <div
                key={p.id}
                draggable={editable}
                onDragStart={(e) => onDragStart(e, p.id)}
                className={cn(
                  "group rounded-lg border border-white/[0.06] bg-card p-3 transition hover:border-white/[0.14]",
                  editable && "cursor-grab active:cursor-grabbing",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {p.date_label ?? "—"}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    {view === "client" && !readOnly && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onApprove?.(p)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRequestChange?.(p)}
                          className="h-6 w-6 p-0"
                        >
                          <AlertCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {editable && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => onEdit?.(p)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete?.(p)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <GripVertical className="h-3 w-3 text-muted-foreground" />
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium leading-snug">{p.theme || "Sem tema"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.format && (
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-white/[0.02] text-[10px] font-normal"
                    >
                      {p.format}
                    </Badge>
                  )}
                  {(p.channels ?? []).slice(0, 2).map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="border-white/10 bg-white/[0.02] text-[10px] font-normal"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
