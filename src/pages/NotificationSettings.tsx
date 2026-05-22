import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Clock, PauseCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getMyNotificationPrefs, updateNotificationPrefs, type NotificationPrefs } from "@/lib/api/notificationPrefs";

const TYPES: Array<{ key: keyof NotificationPrefs; field: "grade" | "attendance" | "payment" | "message" | "ai"; label: string; desc: string }> = [
  { key: "grade_enabled", field: "grade", label: "Notes", desc: "Nouvelles notes saisies par les enseignants" },
  { key: "attendance_enabled", field: "attendance", label: "Présences", desc: "Absences et retards signalés" },
  { key: "ai_enabled", field: "ai", label: "Assistant IA", desc: "Analyses et alertes prédictives" },
  { key: "message_enabled", field: "message", label: "Messages", desc: "Nouveaux messages reçus" },
  { key: "payment_enabled", field: "payment", label: "Paiements", desc: "Mises à jour de statut de paiement" },
];

const NotificationSettingsPage = () => {
  const { user, role } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setPrefs(await getMyNotificationPrefs()); } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (field: "grade" | "attendance" | "payment" | "message" | "ai", value: boolean) => {
    if (!prefs) return;
    const key = `${field}_enabled` as keyof NotificationPrefs;
    setPrefs({ ...prefs, [key]: value } as NotificationPrefs);
    try { await updateNotificationPrefs({ [field]: value } as any); } catch (e: any) { toast.error(e.message); load(); }
  };

  const saveQuiet = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await updateNotificationPrefs({ quietStart: prefs.quiet_hours_start, quietEnd: prefs.quiet_hours_end });
      toast.success("Plage horaire enregistrée");
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const clearQuiet = async () => {
    setSaving(true);
    try { await updateNotificationPrefs({ clearQuiet: true }); toast.success("Plage horaire désactivée"); load(); } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const pauseFor = async (minutes: number) => {
    const until = new Date(Date.now() + minutes * 60_000).toISOString();
    try { await updateNotificationPrefs({ pausedUntil: until }); toast.success(`Pause activée pour ${minutes} min`); load(); } catch (e: any) { toast.error(e.message); }
  };
  const resume = async () => { try { await updateNotificationPrefs({ clearPause: true }); toast.success("Notifications réactivées"); load(); } catch (e: any) { toast.error(e.message); } };

  return (
    <DashboardLayout role={(role as any) ?? "parent"} userName={user?.email ?? "Utilisateur"}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Préférences de notifications</h2>
        <p className="text-muted-foreground">Choisissez quelles notifications recevoir et quand.</p>
      </div>

      {loading || !prefs ? (
        <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Par type</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {TYPES.map((t) => (
                <div key={t.key} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <Label className="text-sm font-medium">{t.label}</Label>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <Switch checked={Boolean(prefs[t.key])} onCheckedChange={(v) => toggle(t.field, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-4 w-4" /> Plage horaire de silence</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Aucune notification ne sera envoyée pendant cette plage (heures UTC).</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Début</Label>
                    <Input type="time" value={prefs.quiet_hours_start ?? ""} onChange={(e) => setPrefs({ ...prefs, quiet_hours_start: e.target.value || null })} />
                  </div>
                  <div>
                    <Label className="text-xs">Fin</Label>
                    <Input type="time" value={prefs.quiet_hours_end ?? ""} onChange={(e) => setPrefs({ ...prefs, quiet_hours_end: e.target.value || null })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveQuiet} disabled={saving || !prefs.quiet_hours_start || !prefs.quiet_hours_end}>Enregistrer</Button>
                  <Button size="sm" variant="outline" onClick={clearQuiet} disabled={saving}>Désactiver</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PauseCircle className="h-4 w-4" /> Pause temporaire</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {prefs.paused_until && new Date(prefs.paused_until) > new Date() ? (
                  <>
                    <p className="text-sm">En pause jusqu'au <b>{new Date(prefs.paused_until).toLocaleString("fr-FR")}</b></p>
                    <Button size="sm" variant="outline" onClick={resume}>Réactiver maintenant</Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Couper toutes les notifications pour une durée définie.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => pauseFor(60)}>1 heure</Button>
                      <Button size="sm" variant="outline" onClick={() => pauseFor(60 * 4)}>4 heures</Button>
                      <Button size="sm" variant="outline" onClick={() => pauseFor(60 * 24)}>24 heures</Button>
                      <Button size="sm" variant="outline" onClick={() => pauseFor(60 * 24 * 7)}>1 semaine</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default NotificationSettingsPage;
