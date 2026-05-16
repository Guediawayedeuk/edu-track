import { useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listStudents, createStudent, deleteStudent } from "@/lib/api/students";
import { listClasses } from "@/lib/api/classes";
import { listParents } from "@/lib/api/parents";
import { toast } from "sonner";

const AdminStudents = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["students"], queryFn: listStudents });
  const { data: classes } = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const { data: parents } = useQuery({ queryKey: ["parents"], queryFn: listParents });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", class_name: "", parent_user_id: "" });

  const createMut = useMutation({
    mutationFn: () => createStudent({ ...form, parent_user_id: form.parent_user_id || null }),
    onSuccess: (res) => {
      toast.success(`Élève créé. Mot de passe : ${res.password}`);
      qc.invalidateQueries({ queryKey: ["students"] });
      setOpen(false);
      setForm({ email: "", first_name: "", last_name: "", class_name: "", parent_user_id: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => { toast.success("Élève supprimé"); qc.invalidateQueries({ queryKey: ["students"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const filtered = (data ?? []).filter((s) => {
    const name = `${s.profile?.first_name ?? ""} ${s.profile?.last_name ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase()) || s.class_name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AdminPageShell
      title="Gestion des élèves"
      subtitle="Liste complète des élèves inscrits"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvel élève</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvel élève</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Prénom</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Nom</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div>
                <Label>Classe</Label>
                <Select value={form.class_name} onValueChange={(v) => setForm({ ...form, class_name: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                  <SelectContent>
                    {(classes ?? []).map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Parent (optionnel)</Label>
                <Select value={form.parent_user_id} onValueChange={(v) => setForm({ ...form, parent_user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    {(parents ?? []).map((p) => <SelectItem key={p.user_id} value={p.user_id}>{p.first_name} {p.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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
              <th className="px-4 py-3">Classe</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Inscription</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun élève</td></tr>}
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.profile?.first_name} {s.profile?.last_name}</td>
                <td className="px-4 py-3">{s.class_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.parent_profile ? `${s.parent_profile.first_name ?? ""} ${s.parent_profile.last_name ?? ""}` : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.enrollment_date).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Supprimer cet élève ?")) deleteMut.mutate(s.id); }}>
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

export default AdminStudents;
