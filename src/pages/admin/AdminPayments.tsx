import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageShell from "./AdminPageShell";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createPayment, deletePayment, listPayments, paymentTotals, recordPayment } from "@/lib/api/payments";
import { listStudents } from "@/lib/api/students";

const statusBadge = (s: string) =>
  s === "paid" ? "bg-emerald-500/15 text-emerald-600"
  : s === "partial" ? "bg-amber-500/15 text-amber-600"
  : s === "overdue" ? "bg-rose-500/15 text-rose-600"
  : "bg-muted text-muted-foreground";

const statusLabel = (s: string) => ({ paid: "Payé", partial: "Partiel", overdue: "En retard", pending: "En attente" } as any)[s] ?? s;

const AdminPayments = () => {
  const qc = useQueryClient();
  const paymentsQ = useQuery({ queryKey: ["payments"], queryFn: () => listPayments() });
  const studentsQ = useQuery({ queryKey: ["students"], queryFn: listStudents });

  const totals = useMemo(() => paymentTotals(paymentsQ.data ?? []), [paymentsQ.data]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", amount: "450", due_date: "", description: "" });

  const createM = useMutation({
    mutationFn: () => createPayment({ student_id: form.student_id, amount: Number(form.amount), due_date: form.due_date || null, description: form.description || null }),
    onSuccess: () => { toast.success("Paiement créé"); qc.invalidateQueries({ queryKey: ["payments"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const recordM = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => recordPayment(id, amount),
    onSuccess: () => { toast.success("Mis à jour"); qc.invalidateQueries({ queryKey: ["payments"] }); },
  });
  const delM = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });

  const studentName = (id: string) => {
    const s = studentsQ.data?.find((x) => x.id === id);
    return s ? `${s.profile?.first_name ?? ""} ${s.profile?.last_name ?? ""}`.trim() : "—";
  };

  return (
    <AdminPageShell
      title="Paiements scolaires"
      subtitle="Suivi des règlements"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouveau paiement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau paiement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Élève</Label>
                <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{studentsQ.data?.map((s) => <SelectItem key={s.id} value={s.id}>{s.profile?.first_name} {s.profile?.last_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Montant (€)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label>Échéance</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={() => createM.mutate()} disabled={!form.student_id || !form.amount}>Créer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Encaissé" value={`${totals.paid.toFixed(0)} €`} icon={CheckCircle2} variant="success" delay={0} />
        <StatCard title="En attente" value={`${totals.pending.toFixed(0)} €`} icon={AlertCircle} variant="warm" delay={0.1} />
        <StatCard title="Transactions" value={paymentsQ.data?.length ?? 0} icon={CreditCard} variant="blue" delay={0.2} />
      </div>
      <div className="glass-card overflow-hidden">
        {paymentsQ.isLoading ? <Skeleton className="h-40 m-4" /> : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr><th className="px-4 py-3">Élève</th><th className="px-4 py-3">Montant</th><th className="px-4 py-3">Payé</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Échéance</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody>
              {(paymentsQ.data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">{studentName(p.student_id)}</td>
                  <td className="px-4 py-3">{Number(p.amount).toFixed(0)} €</td>
                  <td className="px-4 py-3">{Number(p.amount_paid).toFixed(0)} €</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs ${statusBadge(p.status)}`}>{statusLabel(p.status)}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.due_date ?? "—"}</td>
                  <td className="px-4 py-3 text-right flex gap-2 justify-end">
                    {p.status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => recordM.mutate({ id: p.id, amount: Number(p.amount) })}>Marquer payé</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => delM.mutate(p.id)}>Supprimer</Button>
                  </td>
                </tr>
              ))}
              {!paymentsQ.data?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun paiement</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
};

export default AdminPayments;
