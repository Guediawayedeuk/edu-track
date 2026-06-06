import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error("Impossible d'envoyer l'email. Réessayez plus tard.");
      } else {
        setSent(true);
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
            <h1 className="text-2xl font-extrabold text-foreground">Mot de passe oublié</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="font-medium text-foreground">Email envoyé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Si un compte existe pour <span className="font-medium">{email}</span>, vous recevrez un lien de réinitialisation.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@ecole.fr"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 gradient-accent text-accent-foreground font-semibold shadow-lg"
              >
                {submitting ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>

              <Link to="/login" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="inline h-3 w-3 mr-1" /> Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
