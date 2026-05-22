import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, TrendingDown, TrendingUp, Minus, CheckCircle2, ChevronDown, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { markAlertHandled, toggleAlertRecommendation, type AIAlert } from "@/lib/api/aiAlerts";

interface Props {
  alert: AIAlert;
  onChange: () => void;
}

const AIAlertCard = ({ alert: a, onChange }: Props) => {
  const [open, setOpen] = useState(!a.handled_at);
  const [busy, setBusy] = useState(false);
  const state = a.recommendations_state ?? {};

  const handled = !!a.handled_at;
  const total = a.recommendations?.length ?? 0;
  const doneCount = a.recommendations?.filter((_, i) => state[`r${i}`]).length ?? 0;

  const toggleReco = async (i: number, done: boolean) => {
    try { await toggleAlertRecommendation(a.id, `r${i}`, done); onChange(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleMark = async () => {
    setBusy(true);
    try { await markAlertHandled(a.id, !handled); onChange(); toast.success(handled ? "Alerte rouverte" : "Alerte marquée comme traitée"); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className={`rounded-lg border p-4 transition-opacity ${handled ? "border-border/50 opacity-70" : "border-border"}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "default" : "secondary"}>
            {a.severity === "critical" && <AlertTriangle className="mr-1 h-3 w-3" />}
            {a.severity === "critical" ? "Critique" : a.severity === "warning" ? "Attention" : "Info"}
          </Badge>
          {handled && <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Traitée</Badge>}
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.generated_at), { locale: fr, addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {a.current_average != null && <span>Actuelle : <b>{Number(a.current_average).toFixed(2)}/20</b></span>}
          {a.predicted_average != null && (
            <span className="flex items-center gap-1">
              Prédite : <b>{Number(a.predicted_average).toFixed(2)}/20</b>
              {a.trend === "down" ? <TrendingDown className="h-3 w-3 text-destructive" /> : a.trend === "up" ? <TrendingUp className="h-3 w-3 text-primary" /> : <Minus className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm mb-3">{a.summary}</p>

      {total > 0 && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between -ml-2">
              <span className="text-xs font-medium">Recommandations — {doneCount}/{total} validées</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full gradient-accent transition-all" style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : "0%" }} />
            </div>
            <ul className="space-y-2 text-sm">
              {a.recommendations.map((r, i) => {
                const done = !!state[`r${i}`];
                return (
                  <li key={i} className="flex items-start gap-2 rounded-md border border-border/50 p-2">
                    <Checkbox checked={done} onCheckedChange={(v) => toggleReco(i, !!v)} className="mt-0.5" />
                    <div className={done ? "opacity-60 line-through" : ""}>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="mt-3 flex justify-end">
        <Button size="sm" variant={handled ? "outline" : "default"} onClick={handleMark} disabled={busy}>
          {handled ? <><RotateCcw className="mr-2 h-3 w-3" /> Rouvrir</> : <><CheckCircle2 className="mr-2 h-3 w-3" /> Marquer comme traitée</>}
        </Button>
      </div>
    </div>
  );
};

export default AIAlertCard;
