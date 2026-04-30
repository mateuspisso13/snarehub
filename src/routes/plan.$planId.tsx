import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { type PostRow } from "@/components/PostCard";
import { PostEditor } from "@/components/PostEditor";
import { ImportDialog } from "@/components/ImportDialog";
import { PostsView, type ViewMode } from "@/components/PostsView";
import { ViewModeToggle, loadViewMode } from "@/components/ViewModeToggle";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Link2, Check } from "lucide-react";
import { MONTHS_PT } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/plan/$planId")({
  component: PlanPage,
});

type Plan = {
  id: string;
  client_id: string;
  year: number;
  month: number;
  title: string | null;
  share_token: string;
  status: string;
};
type Client = { id: string; name: string };

function PlanPage() {
  const { planId } = useParams({ from: "/plan/$planId" });
  const nav = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  // Default view: AGENCY (per user preference)
  const [view, setView] = useState<"agency" | "client">("agency");
  const [mode, setMode] = useState<ViewMode>("table");
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"review" | "approved">("review");

  useEffect(() => {
    setMode(loadViewMode());
  }, []);

  async function load() {
    if (!planId) return;
    const { data: p } = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();
    if (!p) {
      toast.error("Planejamento não encontrado.");
      nav({ to: "/" });
      return;
    }
    setPlan(p as Plan);
    const { data: c } = await supabase
      .from("clients")
      .select("id,name")
      .eq("id", (p as Plan).client_id)
      .maybeSingle();
    setClient((c ?? null) as Client | null);
    const { data: ps } = await supabase
      .from("posts")
      .select("*")
      .eq("plan_id", planId)
      .order("position");
    setPosts((ps ?? []) as PostRow[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const nextPos = useMemo(
    () => (posts.length ? Math.max(...posts.map((p) => p.position)) + 1 : 0),
    [posts],
  );
  const reviewPosts = useMemo(
    () => posts.filter((p) => p.approval_status !== "approved"),
    [posts],
  );
  const approvedPosts = useMemo(
    () => posts.filter((p) => p.approval_status === "approved"),
    [posts],
  );

  async function savePost(patch: Partial<PostRow>): Promise<void> {
    if (!editing) return;
    const { id: _id, ...rest } = patch as PostRow;
    void _id;
    const fields = {
      ...rest,
      carousel_content: Array.isArray(rest.carousel_content) ? rest.carousel_content : [],
    } as never;
    const { error } = await supabase.from("posts").update(fields).eq("id", editing.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Post atualizado.");
    load();
  }

  async function deletePost() {
    if (!editing) return;
    if (!confirm("Excluir este post?")) return;
    await supabase.from("posts").delete().eq("id", editing.id);
    setEditorOpen(false);
    load();
  }

  async function deletePostById(post: PostRow) {
    if (!confirm("Excluir este post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success("Post removido.");
    load();
  }

  async function setStatus(post: PostRow, status: string) {
    // optimistic
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, approval_status: status } : p)),
    );
    const { error } = await supabase
      .from("posts")
      .update({ approval_status: status })
      .eq("id", post.id);
    if (error) {
      toast.error(error.message);
      load();
    }
  }

  async function inlineUpdate(post: PostRow, patch: Partial<PostRow>) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...patch } : p)));
    const { error } = await supabase.from("posts").update(patch as never).eq("id", post.id);
    if (error) {
      toast.error(error.message);
      load();
    }
  }

  async function addEmpty() {
    if (!plan) return;
    const { error } = await supabase.from("posts").insert({
      plan_id: plan.id,
      position: nextPos,
      theme: "Novo post",
      format: "Estático",
      channels: ["Instagram"],
    });
    if (error) return toast.error(error.message);
    load();
  }

  function copyShareLink() {
    if (!plan) return;
    const url = `${window.location.origin}/share/${plan.share_token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado.");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!plan) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        right={
          <>
            <ViewModeToggle value={mode} onChange={setMode} />
            <ToggleGroup
              type="single"
              size="sm"
              value={view}
              onValueChange={(v) => v && setView(v as "agency" | "client")}
              className="rounded-md border border-white/10 bg-white/[0.02] p-0.5"
            >
              <ToggleGroupItem value="agency" className="h-7 px-3 text-xs">
                Visão Agência
              </ToggleGroupItem>
              <ToggleGroupItem value="client" className="h-7 px-3 text-xs">
                Visão Cliente
              </ToggleGroupItem>
            </ToggleGroup>
          </>
        }
      />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <button
              onClick={() => nav({ to: "/" })}
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar ao hub
            </button>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {client?.name ?? "Cliente"}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              {plan.title || `${MONTHS_PT[plan.month - 1]} ${plan.year}`}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {posts.length} posts no planejamento
            </p>
          </div>
          {view === "agency" && (
            <div className="flex gap-2">
              <ImportDialog planId={plan.id} startPosition={nextPos} onImported={load} />
              <Button onClick={addEmpty} className="bg-gradient-primary">
                <Plus className="mr-1.5 h-4 w-4" /> Novo post
              </Button>
            </div>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <p className="text-base font-medium">Nenhum post ainda</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Importe um HTML de planejamento existente ou comece do zero adicionando um post.
            </p>
            <div className="mt-5 flex gap-2">
              <ImportDialog planId={plan.id} startPosition={0} onImported={load} />
              <Button onClick={addEmpty} className="bg-gradient-primary">
                <Plus className="mr-1.5 h-4 w-4" /> Criar primeiro post
              </Button>
            </div>
          </div>
        ) : mode === "kanban" ? (
          // Kanban shows all posts grouped by status — tabs are not used
          <div>
            <div className="mb-6 flex items-center justify-end">
              {approvedPosts.length > 0 && (
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  {copied ? (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Gerar link de visualização
                </Button>
              )}
            </div>
            <PostsView
              posts={posts}
              view={view}
              mode="kanban"
              onEdit={(p) => {
                setEditing(p);
                setEditorOpen(true);
              }}
              onDelete={deletePostById}
              onSetStatus={setStatus}
              onApprove={(p) =>
                setStatus(p, p.approval_status === "approved" ? "pending" : "approved")
              }
              onRequestChange={(p) =>
                setStatus(
                  p,
                  p.approval_status === "changes_requested" ? "pending" : "changes_requested",
                )
              }
              onUpdate={inlineUpdate}
            />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "review" | "approved")}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <TabsList className="border border-white/10 bg-white/[0.03]">
                <TabsTrigger value="review" className="data-[state=active]:bg-white/[0.08]">
                  Em revisão · {reviewPosts.length}
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-white/[0.08]">
                  Aprovados · {approvedPosts.length}
                </TabsTrigger>
              </TabsList>
              {tab === "approved" && approvedPosts.length > 0 && (
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  {copied ? (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Gerar link de visualização
                </Button>
              )}
            </div>

            <TabsContent value="review" className="mt-0">
              <PostsView
                posts={reviewPosts}
                view={view}
                mode={mode}
                onEdit={(p) => {
                  setEditing(p);
                  setEditorOpen(true);
                }}
                onDelete={deletePostById}
                onApprove={(p) =>
                  setStatus(p, p.approval_status === "approved" ? "pending" : "approved")
                }
                onRequestChange={(p) =>
                  setStatus(
                    p,
                    p.approval_status === "changes_requested" ? "pending" : "changes_requested",
                  )
                }
                onSetStatus={setStatus}
                onUpdate={inlineUpdate}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              <PostsView
                posts={approvedPosts}
                view={view}
                mode={mode}
                onEdit={(p) => {
                  setEditing(p);
                  setEditorOpen(true);
                }}
                onDelete={deletePostById}
                onApprove={(p) => setStatus(p, "pending")}
                onRequestChange={(p) => setStatus(p, "changes_requested")}
                onSetStatus={setStatus}
                onUpdate={inlineUpdate}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <PostEditor
        post={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={savePost}
        onDelete={deletePost}
      />
    </div>
  );
}
