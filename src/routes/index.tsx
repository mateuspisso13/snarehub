import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MONTHS_PT, MONTHS_PT_SHORT } from "@/lib/constants";
import { Plus, Building2, ArrowRight, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Client = { id: string; name: string; slug: string; accent_color: string };
type Plan = { id: string; client_id: string; year: number; month: number; status: string };

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function IndexPage() {
  const nav = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [newName, setNewName] = useState("");
  const [openNew, setOpenNew] = useState(false);

  async function reload() {
    const { data: c } = await supabase.from("clients").select("*").order("name");
    setClients((c ?? []) as Client[]);
    if (!activeClient && c && c.length) setActiveClient(c[0].id);
    const { data: p } = await supabase.from("plans").select("*");
    setPlans((p ?? []) as Plan[]);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planByMonth = useMemo(() => {
    const m = new Map<number, Plan>();
    plans
      .filter((p) => p.client_id === activeClient && p.year === year)
      .forEach((p) => m.set(p.month, p));
    return m;
  }, [plans, activeClient, year]);

  async function addClient() {
    const name = newName.trim();
    if (!name) return;
    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase.from("clients").insert({ name, slug }).select().single();
    if (error) return toast.error(error.message);
    setNewName("");
    setOpenNew(false);
    setActiveClient(data!.id);
    reload();
    toast.success("Cliente criado.");
  }

  async function deleteClient(id: string) {
    if (!confirm("Excluir este cliente e todos os planejamentos?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setActiveClient(null);
    reload();
  }

  async function openMonth(month: number) {
    if (!activeClient) return;
    let plan = planByMonth.get(month);
    if (!plan) {
      const { data, error } = await supabase
        .from("plans")
        .insert({
          client_id: activeClient,
          year,
          month,
          title: `${MONTHS_PT[month - 1]} ${year}`,
        })
        .select()
        .single();
      if (error) return toast.error(error.message);
      plan = data as Plan;
    }
    nav({ to: "/plan/$planId", params: { planId: plan.id } });
  }

  const activeClientObj = clients.find((c) => c.id === activeClient);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto grid max-w-[1400px] grid-cols-[260px_1fr] gap-0">
        {/* Sidebar */}
        <aside className="sticky top-14 h-[calc(100vh-3.5rem)] border-r border-white/[0.06] px-4 py-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Clientes
            </p>
            <Dialog open={openNew} onOpenChange={setOpenNew}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo cliente</DialogTitle>
                  <DialogDescription>
                    Crie um workspace para gerenciar planejamentos mensais.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: HFM Log"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button onClick={addClient} className="bg-gradient-primary">
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <nav className="space-y-1">
            {clients.length === 0 && (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                Nenhum cliente. Crie o primeiro.
              </p>
            )}
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveClient(c.id)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition",
                  activeClient === c.id
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-[10px] font-semibold">
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate">{c.name}</span>
                </span>
                <Trash2
                  className="h-3 w-3 opacity-0 transition group-hover:opacity-50 hover:!opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteClient(c.id);
                  }}
                />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="relative min-h-[calc(100vh-3.5rem)] bg-mesh px-8 py-10">
          {!activeClientObj ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Selecione ou crie um cliente</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Cada cliente tem seu próprio histórico mensal de planejamentos. Comece adicionando um na barra lateral.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Workspace
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    {activeClientObj.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Planejamentos mensais · escolha um mês para abrir ou criar.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setYear(year - 1)}>
                    −
                  </Button>
                  <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-sm">
                    {year}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setYear(year + 1)}>
                    +
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {MONTHS_PT.map((label, i) => {
                  const month = i + 1;
                  const plan = planByMonth.get(month);
                  const exists = !!plan;
                  return (
                    <button
                      key={month}
                      onClick={() => openMonth(month)}
                      className={cn(
                        "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition",
                        exists
                          ? "border-white/[0.1] bg-card hover:border-primary/40 hover:shadow-elegant"
                          : "border-dashed border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02]",
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {MONTHS_PT_SHORT[i]}
                        </span>
                        {exists ? (
                          <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-medium text-success">
                            Ativo
                          </span>
                        ) : (
                          <Plus className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-base font-semibold tracking-tight">{label}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {exists ? (
                          <>
                            Abrir <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                          </>
                        ) : (
                          <>Criar planejamento</>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <section className="mt-12 rounded-2xl border border-white/[0.06] bg-card p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">Como funciona</h3>
                    <p className="text-xs text-muted-foreground">
                      Abra um mês, importe seu HTML de planejamento ou crie posts do zero. Aprove e gere o link público para o cliente.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
