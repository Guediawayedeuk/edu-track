import { useState } from "react";
import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listSubjects, createSubject, deleteSubject } from "@/lib/api/subjects";
import { toast } from "sonner";

const AdminSubjects = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["subjects"], queryFn: listSubjects });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", color: "#3b82f6" });

  const createMut = useMutation({
    mutationFn: () => createSubject({ name: form.name, code: form.code || null, color: form.color || null }),
    onSuccess: () => {
      toast.success("Matière créée");
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setOpen(false);
      setForm({ name: "", code: "", color: "#3b82f6" });
    },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => { toast.success("Matière supprimée"); qc.invalidateQueries({ queryKey: ["subjects"] }); },
    onError: (e: any) => toast.error(e.message ?? "Erreur"),
  });

  return (
    <AdminPageShell
      title="Gestion des matières"
      subtitle="Catalogue des matières enseignées"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvelle matière</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle matière</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div><Label>Couleur</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
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
              <th className="px-4 py-3">Couleur</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>}
            {!isLoading && (data ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Aucune matière</td></tr>}
            {(data ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3"><span className="inline-block h-4 w-4 rounded" style={{ background: s.color ?? "#888" }} /></td>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.code ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Supprimer cette matière ?")) deleteMut.mutate(s.id); }}>
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

export default AdminSubjects;
