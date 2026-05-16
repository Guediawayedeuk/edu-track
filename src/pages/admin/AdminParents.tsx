import { useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listParents, createParent, deleteParent } from "@/lib/api/parents";
import { toast } from "sonner";

const AdminParents = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["parents"], queryFn: listParents });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "" });

  const createMut = useMutation({
    mutationFn: () => createParent(form),
    onSuccess: (res) => {
      toast.success(`Parent créé. Mot de passe : ${res.password}`);
      qc.invalidateQueries({ queryKey: ["parents"] });
      setOpen(false);
      setForm({ email: "", first_name: "", last_name: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteParent,
    onSuccess: () => { toast.success("Parent supprimé"); qc.invalidateQueries({ queryKey: ["parents"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const filtered = (data ?? []).filter((p) =>
    `${p.first_name ?? ""} ${p.last_name ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageShell
      title="Gestion des parents"
      subtitle="Comptes parents et nombre d'enfants associés"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouveau parent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau parent</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Prénom</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Nom</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <DialogFooter><Button disabled={createMut.isPending} onClick={() => createMut.mutate()}>Créer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="glass-card p-4 mb-4 flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-0 bg-transparent focus-visible:ring-0" />
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Enfants</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={3} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Aucun parent</td></tr>}
            {filtered.map((p) => (
              <tr key={p.user_id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3">{p.children_count}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Supprimer ce parent ?")) deleteMut.mutate(p.user_id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
};

export default AdminParents;
