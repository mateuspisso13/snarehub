import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Code2 } from "lucide-react";
import { extractPostsFromHtml, mapImportedToRow, type ImportedPost } from "@/lib/htmlImporter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  planId: string;
  startPosition: number;
  onImported: () => void;
  trigger?: React.ReactNode;
}

export function ImportDialog({ planId, startPosition, onImported, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);

  async function importPosts(html: string, mode: "replace" | "append") {
    setBusy(true);
    try {
      const data: ImportedPost[] = extractPostsFromHtml(html);
      if (mode === "replace") {
        await supabase.from("posts").delete().eq("plan_id", planId);
      }
      const offset = mode === "replace" ? 0 : startPosition;
      const rows = data.map((p, i) => mapImportedToRow(p, offset + i, planId));
      const { error } = await supabase.from("posts").insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} posts importados.`);
      setOpen(false);
      setPaste("");
      onImported();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file: File, mode: "replace" | "append") {
    const text = await file.text();
    await importPosts(text, mode);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Importar HTML</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar planejamento HTML</DialogTitle>
          <DialogDescription>
            Faça upload do arquivo .html ou cole o conteúdo. O sistema extrai o array <code className="rounded bg-muted px-1 py-0.5 text-xs">postsData</code> automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste" className="mt-2">
          <TabsList>
            <TabsTrigger value="paste"><Code2 className="mr-1.5 h-3.5 w-3.5" /> Colar código</TabsTrigger>
            <TabsTrigger value="file"><Upload className="mr-1.5 h-3.5 w-3.5" /> Arquivo</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="space-y-3">
            <Textarea
              placeholder="Cole aqui o HTML completo ou apenas o trecho `const postsData = [...]`"
              rows={10}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              className="font-mono text-xs"
            />
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" disabled={busy || !paste.trim()} onClick={() => importPosts(paste, "append")}>
                Adicionar ao plano
              </Button>
              <Button disabled={busy || !paste.trim()} onClick={() => importPosts(paste, "replace")} className="bg-gradient-primary">
                Substituir plano
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="file" className="space-y-3">
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition hover:border-primary/40">
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm">Clique para selecionar um arquivo .html</p>
              <p className="text-xs text-muted-foreground">Será analisado localmente no seu navegador.</p>
              <input
                type="file"
                accept=".html,text/html"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f, "replace");
                }}
              />
            </label>
            <p className="text-xs text-muted-foreground">O upload substitui os posts existentes. Para adicionar, use a aba "Colar código".</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
