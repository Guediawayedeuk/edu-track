import { useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listClasses, createClass, deleteClass } from "@/lib/api/classes";
import { toast } from "sonner";

const AdminClasses = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "", room: "" });

  const createMut = useMutation({
    mutationFn: () => createClass({ name: form.name, level: form.level || null, room: form.room || null, main_teacher_id: null }),
    onSuccess: () => {
      toast.success("Classe créée");
      qc.invalidateQueries({ queryKey: ["classes"] });
      setOpen(false);
      setForm({ name: "", level: "", room: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => { toast.success("Classe supprimée"); qc.invalidateQueries({ queryKey: ["classes"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <AdminPageShell
      title="Gestion des classes"
      subtitle="Créer et organiser les classes de l'établissement"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvelle classe</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle classe</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom (ex: 6ème A)</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Niveau</Label><Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} /></div>
              <div><Label>Salle</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></div>
            </div>
            <DialogFooter><Button disabled={createMut.isPending} onClick={() => createMut.mutate()}>Créer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Niveau</th>
              <th className="px-4 py-3">Salle</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>}
            {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucune classe</td></tr>}
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.level ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.room ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Supprimer cette classe ?")) deleteMut.mutate(c.id); }}>
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

export default AdminClasses;
