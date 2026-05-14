import AdminPageShell from "./AdminPageShell";
import StatCard from "@/components/StatCard";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const payments = [
  { eleve: "Lucas Petit", montant: 450, statut: "Payé", date: "10 mai 2026" },
  { eleve: "Emma Moreau", montant: 450, statut: "En attente", date: "—" },
  { eleve: "Hugo Garcia", montant: 450, statut: "Payé", date: "08 mai 2026" },
  { eleve: "Léa Roux", montant: 225, statut: "Partiel", date: "05 mai 2026" },
];

const badge = (s: string) => s === "Payé" ? "bg-emerald-500/15 text-emerald-600" : s === "Partiel" ? "bg-amber-500/15 text-amber-600" : "bg-rose-500/15 text-rose-600";

const AdminPayments = () => (
  <AdminPageShell title="Paiements scolaires" subtitle="Suivi des règlements et relances">
    <div className="grid gap-4 sm:grid-cols-3 mb-6">
      <StatCard title="Encaissé" value="98 450 €" icon={CheckCircle2} variant="success" delay={0} />
      <StatCard title="En attente" value="12 300 €" icon={AlertCircle} variant="warm" delay={0.1} />
      <StatCard title="Transactions" value={210} icon={CreditCard} variant="blue" delay={0.2} />
    </div>
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr><th className="px-4 py-3">Élève</th><th className="px-4 py-3">Montant</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Action</th></tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.eleve} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">{p.eleve}</td>
              <td className="px-4 py-3">{p.montant} €</td>
              <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs ${badge(p.statut)}`}>{p.statut}</span></td>
              <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
              <td className="px-4 py-3 text-right"><Button size="sm" variant="outline">Relancer</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminPageShell>
);

export default AdminPayments;
