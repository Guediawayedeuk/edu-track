import { useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listTeachers, createTeacher, deleteTeacherUser } from "@/lib/api/teachers";
import { toast } from "sonner";

const AdminTeachers = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["teachers"], queryFn: listTeachers });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", subject: "" });

  const createMut = useMutation({
    mutationFn: createTeacher,
    onSuccess: (res) => {
      toast.success(`Enseignant créé. Mot de passe temporaire : ${res.password}`);
      qc.invalidateQueries({ queryKey: ["teachers"] });
      setOpen(false);
      setForm({ email: "", first_name: "", last_name: "", subject: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur lors de la création"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTeacherUser,
    onSuccess: () => {
      toast.success("Enseignant supprimé");
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur lors de la suppression"),
  });

  const filtered = (data ?? []).filter((t) => {
    const name = `${t.profile?.first_name ?? ""} ${t.profile?.last_name ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AdminPageShell
      title="Gestion des enseignants"
      subtitle="Ajouter, modifier ou supprimer le personnel enseignant"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Nouvel enseignant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvel enseignant</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Prénom</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Nom</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Matière</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button disabled={createMut.isPending} onClick={() => createMut.mutate(form)}>Créer</Button>
            </DialogFooter>
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
              <th className="px-4 py-3">Matière</th>
              <th className="px-4 py-3">Date d'embauche</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-t border-border"><td colSpan={4} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucun enseignant</td></tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{t.profile?.first_name} {t.profile?.last_name}</td>
                <td className="px-4 py-3">{t.subject}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.hire_date).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Supprimer cet enseignant ?")) deleteMut.mutate(t.user_id); }}>
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

export default AdminTeachers;
