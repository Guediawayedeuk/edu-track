import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, UserCheck, LayoutDashboard, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface RoleLoadingScreenProps {
  message?: string;
  /** Which step is currently in progress: 0=session, 1=role, 2=redirect */
  step?: 0 | 1 | 2;
}

const STEPS = [
  { label: "Vérification de la session", icon: ShieldCheck },
  { label: "Détection de votre rôle", icon: UserCheck },
  { label: "Redirection vers votre espace", icon: LayoutDashboard },
];

const RoleLoadingScreen = ({ message, step }: RoleLoadingScreenProps) => {
  // Auto-detect step from message for backward compatibility
  const detectedStep: 0 | 1 | 2 =
    step ??
    (message?.toLowerCase().includes("session")
      ? 0
      : message?.toLowerCase().includes("redirection")
        ? 2
        : 1);

  const [progress, setProgress] = useState(0);
  const target = ((detectedStep + 1) / STEPS.length) * 100;

  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const headline = message ?? STEPS[detectedStep].label + "...";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
      {/* Soft animated halos */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 glass-card p-8 md:p-10 w-[92%] max-w-md mx-4"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-lg"
          >
            <GraduationCap className="h-9 w-9 text-accent-foreground" />
          </motion.div>
          <h2 className="text-lg font-bold text-foreground">EduTrack</h2>
          <p className="mt-1 text-sm text-muted-foreground min-h-[1.25rem]">{headline}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full gradient-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Étape {detectedStep + 1} / {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Step list */}
        <ul className="mt-5 space-y-2">
          {STEPS.map((s, i) => {
            const done = i < detectedStep;
            const active = i === detectedStep;
            const Icon = s.icon;
            return (
              <li
                key={s.label}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  active
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : done
                      ? "border-border bg-muted/40 text-muted-foreground"
                      : "border-border/60 bg-transparent text-muted-foreground/70"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? "bg-accent text-accent-foreground"
                      : active
                        ? "gradient-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="flex-1 text-left font-medium">{s.label}</span>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Si l'écran reste affiché plus de quelques secondes, vérifiez votre connexion internet.
        </p>
      </motion.div>
    </div>
  );
};

export default RoleLoadingScreen;
