import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { type PostRow } from "@/components/PostCard";
import { PostsView, type ViewMode } from "@/components/PostsView";
import { ViewModeToggle, loadViewMode } from "@/components/ViewModeToggle";
import { Sparkles, Eye } from "lucide-react";
import { MONTHS_PT } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/share/$token")({
  component: SharePage,
});

type Plan = { id: string; client_id: string; year: number; month: number; title: string | null };
type Client = { id: string; name: string };

function SharePage() {
  const { token } = useParams({ from: "/share/$token" });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>("table");

  useEffect(() => {
    setMode(loadViewMode());
  }, []);

  async function load() {
    if (!token) return;
    const { data: p } = await supabase
      .from("plans")
      .select("*")
      .eq("share_token", token)
      .maybeSingle();
    if (!p) {
      setLoading(false);
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
      .eq("plan_id", (p as Plan).id)
      .eq("approval_status", "approved")
      .order("position");
    setPosts((ps ?? []) as PostRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function setStatus(post: PostRow, status: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, approval_status: status } : p)),
    );
    const { error } = await supabase
      .from("posts")
      .update({ approval_status: status })
      .eq("id", post.id);
    if (error) toast.error(error.message);
  }

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!plan)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold">Link inválido</p>
          <p className="text-sm text-muted-foreground">
            Esse planejamento não existe ou o link foi revogado.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Snare — {client?.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ViewModeToggle value={mode} onChange={setMode} />
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <Eye className="h-3.5 w-3.5" /> Visualização
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {client?.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {plan.title || `${MONTHS_PT[plan.month - 1]} ${plan.year}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} no planejamento.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <p className="text-base font-medium">Planejamento em preparação</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Os posts aparecerão aqui assim que forem finalizados pela agência.
            </p>
          </div>
        ) : (
          <PostsView
            posts={posts}
            view="client"
            mode={mode}
            readOnly
            onApprove={(p) =>
              setStatus(p, p.approval_status === "approved" ? "pending" : "approved")
            }
            onRequestChange={(p) =>
              setStatus(
                p,
                p.approval_status === "changes_requested" ? "pending" : "changes_requested",
              )
            }
          />
        )}
      </main>
    </div>
  );
}
