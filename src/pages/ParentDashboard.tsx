import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TimetablePreview from "@/components/TimetablePreview";
import AIAlertCard from "@/components/AIAlertCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Award, Calendar, Download, Sparkles, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { generateBulletinPDF, getBulletinData, type BulletinData } from "@/lib/api/bulletins";
import { listAlertsForStudent, requestAIAnalysis, type AIAlert } from "@/lib/api/aiAlerts";
import { toast } from "sonner";

const ParentDashboard = () => {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [data, setData] = useState<BulletinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const loadAlerts = async (sid: string) => {
    try { setAlerts(await listAlertsForStudent(sid)); } catch {}
  };

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: ss } = await supabase
        .from("students")
        .select("id")
        .or(`parent_user_id.eq.${user.id},user_id.eq.${user.id}`)
        .limit(1)
        .maybeSingle();
      if (!ss) { setLoading(false); return; }
      setStudentId(ss.id);
      try {
        const b = await getBulletinData(ss.id);
        setData(b);
        await loadAlerts(ss.id);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleDownload = async () => {
    if (!data) return;
    await generateBulletinPDF(data);
    toast.success("Bulletin généré");
  };

  const handleAnalyze = async () => {
    if (!studentId) return;
    setAnalyzing(true);
    try {
      await requestAIAnalysis(studentId);
      await loadAlerts(studentId);
      toast.success("Analyse IA terminée");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const fullName = useMemo(() => data ? `${data.student.first_name} ${data.student.last_name}`.trim() : "", [data]);

  return (
    <DashboardLayout role="parent" userName={fullName || "Parent"}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{fullName ? `Suivi de ${fullName}` : "Mon enfant"}</h2>
          <p className="text-muted-foreground">{data ? `Classe ${data.student.class_name}` : "Aucun élève associé"}</p>
        </div>
        {data && (
          <Button onClick={handleDownload} className="gradient-primary text-primary-foreground">
            <Download className="mr-2 h-4 w-4" /> Télécharger le bulletin PDF
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard title="Moyenne générale" value={`${data.overallAverage.toFixed(2)}/20`} icon={Award} variant="blue" delay={0} />
            <StatCard title="Évaluations" value={data.subjects.reduce((a, s) => a + s.count, 0)} icon={ClipboardList} variant="teal" delay={0.1} />
            <StatCard title="Absences" value={data.attendance.absent} subtitle={`${data.attendance.late} retards`} icon={Calendar} variant="warm" delay={0.2} />
            <StatCard title="Présences" value={data.attendance.present} icon={Award} variant="success" delay={0.3} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">Notes par matière</h3>
              {data.subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune note saisie</p>
              ) : (
                <div className="space-y-3">
                  {data.subjects.map((s, i) => (
                    <motion.div key={s.subject}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center gap-3">
                      <span className="w-32 text-sm font-medium text-foreground truncate">{s.subject}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full gradient-accent" style={{ width: `${(s.average / 20) * 100}%` }} />
                      </div>
                      <span className="w-16 text-right text-sm font-bold text-foreground">{s.average.toFixed(2)}/20</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            <TimetablePreview />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 mt-6"
          >
            <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Assistant IA — Analyse & recommandations</h3>
              </div>
              <Button onClick={handleAnalyze} disabled={analyzing} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                {analyzing ? "Analyse en cours..." : "Lancer une analyse"}
              </Button>
            </div>

            {/* Filters */}
            {alerts.length > 0 && (
              <div className="mb-4 grid gap-2 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Rechercher dans les alertes..." className="pl-9 h-9" value={alertSearch} onChange={(e) => setAlertSearch(e.target.value)} />
                </div>
                <Select value={sevFilter} onValueChange={setSevFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Sévérité" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes sévérités</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                    <SelectItem value="warning">Attention</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="open">À traiter</SelectItem>
                    <SelectItem value="handled">Traitées</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={alertFrom} onChange={(e) => setAlertFrom(e.target.value)} className="h-9 md:col-span-2" />
                <Input type="date" value={alertTo} onChange={(e) => setAlertTo(e.target.value)} className="h-9 md:col-span-2" />
                {(alertSearch || sevFilter !== "all" || statusFilter !== "all" || alertFrom || alertTo) && (
                  <Button size="sm" variant="ghost" onClick={() => { setAlertSearch(""); setSevFilter("all"); setStatusFilter("all"); setAlertFrom(""); setAlertTo(""); }} className="h-9 md:col-span-4 justify-start">
                    <X className="mr-1 h-3 w-3" /> Réinitialiser les filtres
                  </Button>
                )}
              </div>
            )}

            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune analyse encore. Cliquez sur "Lancer une analyse" pour obtenir une prédiction et des recommandations personnalisées.</p>
            ) : filteredAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune alerte ne correspond aux filtres.</p>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((a) => (
                  <AIAlertCard key={a.id} alert={a} onChange={() => studentId && loadAlerts(studentId)} />
                ))}
              </div>
            )}
          </motion.div>
        </>
      ) : (
        <div className="glass-card p-12 text-center text-muted-foreground">
          Aucun élève n'est encore associé à votre compte. Contactez l'administration.
        </div>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;
