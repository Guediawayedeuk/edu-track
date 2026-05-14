import AdminPageShell from "./AdminPageShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Key, Lock, History } from "lucide-react";

const settings = [
  { icon: Shield, titre: "Authentification à deux facteurs", desc: "Exiger un 2FA pour tous les administrateurs", enabled: true },
  { icon: Lock, titre: "Verrouillage automatique", desc: "Déconnexion après 30 min d'inactivité", enabled: true },
  { icon: Key, titre: "Politique de mots de passe forts", desc: "Minimum 12 caractères avec symboles", enabled: false },
  { icon: History, titre: "Journal d'audit complet", desc: "Tracer toutes les actions sensibles", enabled: true },
];

const AdminSecurity = () => (
  <AdminPageShell title="Paramètres de sécurité" subtitle="Politique d'accès et confidentialité">
    <div className="space-y-3 mb-6">
      {settings.map((s) => (
        <div key={s.titre} className="glass-card p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <s.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{s.titre}</h4>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
          <Switch defaultChecked={s.enabled} />
        </div>
      ))}
    </div>
    <div className="glass-card p-5">
      <h3 className="font-semibold text-foreground mb-2">Sauvegarde des données</h3>
      <p className="text-sm text-muted-foreground mb-3">Dernière sauvegarde automatique : aujourd'hui à 03h00</p>
      <Button className="gradient-primary text-primary-foreground">Lancer une sauvegarde manuelle</Button>
    </div>
  </AdminPageShell>
);

export default AdminSecurity;
