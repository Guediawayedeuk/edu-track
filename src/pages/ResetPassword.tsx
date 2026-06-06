import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase places the recovery session in URL hash; the client picks it up automatically.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      toast.error("Mot de passe trop court (min. 6 caractères)");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error("Impossible de mettre à jour le mot de passe");
      } else {
        toast.success("Mot de passe mis à jour");
        navigate("/login", { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent shadow-lg">
              <GraduationCap className="h-9 w-9 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choisissez un nouveau mot de passe sécurisé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="password" className="text-xs text-muted-foreground">Nouveau mot de passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm" className="text-xs text-muted-foreground">Confirmer le mot de passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !ready}
              className="w-full h-11 gradient-accent text-accent-foreground font-semibold shadow-lg"
            >
              {submitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
            {!ready && (
              <p className="text-center text-xs text-muted-foreground">
                Lien invalide ou expiré ? Demandez un nouveau lien depuis "Mot de passe oublié".
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
